/**
 * $Revision: 1722 $
 * $Date: 2005-07-28 15:19:16 -0700 (Thu, 28 Jul 2005) $
 *
 * Copyright (C) 2005-2008 Jive Software. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.jivesoftware.openfire.plugin;

import java.io.File;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.StringTokenizer;
import java.lang.reflect.*;

import org.jivesoftware.openfire.SharedGroupException;
import org.jivesoftware.openfire.XMPPServer;
import org.jivesoftware.openfire.container.Plugin;
import org.jivesoftware.openfire.container.PluginManager;
import org.jivesoftware.openfire.group.Group;
import org.jivesoftware.openfire.group.GroupManager;
import org.jivesoftware.openfire.group.GroupNotFoundException;
import org.jivesoftware.openfire.lockout.LockOutManager;
import org.jivesoftware.openfire.roster.Roster;
import org.jivesoftware.openfire.roster.RosterItem;
import org.jivesoftware.openfire.roster.RosterManager;
import org.jivesoftware.openfire.user.User;
import org.jivesoftware.openfire.user.UserAlreadyExistsException;
import org.jivesoftware.openfire.user.UserManager;
import org.jivesoftware.openfire.user.UserNotFoundException;
import org.jivesoftware.openfire.auth.*;
import org.jivesoftware.util.JiveGlobals;
import org.jivesoftware.util.PropertyEventDispatcher;
import org.jivesoftware.util.PropertyEventListener;
import org.jivesoftware.util.StringUtils;
import org.jivesoftware.util.Log;
import org.xmpp.packet.JID;
import org.apache.commons.lang.RandomStringUtils;
import org.json.*;

/**
 * Plugin that allows the administration of users via HTTP requests.
 *
 * @author Justin Hunt
 */
public class UserServicePlugin implements Plugin, PropertyEventListener {
    private UserManager userManager;
    private RosterManager rosterManager;
    private XMPPServer server;

    private String secret;
    private boolean enabled;
    private Collection<String> allowedIPs;

    public void initializePlugin(PluginManager manager, File pluginDirectory) {
        server = XMPPServer.getInstance();
        userManager = server.getUserManager();
        rosterManager = server.getRosterManager();
        
        secret = JiveGlobals.getProperty("plugin.userservice.secret", "");
        // If no secret key has been assigned to the user service yet, assign a random one.
        if (secret.equals("")){
            secret = StringUtils.randomString(8);
            setSecret(secret);
        }
        
        // See if the service is enabled or not.
        enabled = JiveGlobals.getBooleanProperty("plugin.userservice.enabled", false);

        // Get the list of IP addresses that can use this service. An empty list means that this filter is disabled.
        allowedIPs = StringUtils.stringToCollection(JiveGlobals.getProperty("plugin.userservice.allowedIPs", ""));

        // Listen to system property events
        PropertyEventDispatcher.addListener(this);
    }

    public void destroyPlugin() {
        userManager = null;
        // Stop listening to system property events
        PropertyEventDispatcher.removeListener(this);
    }

    private String userResponse(String username, AuthToken authToken)
            throws UserNotFoundException
    {
        User user = getUser(username);
        String genToken = RandomStringUtils.randomAlphanumeric(64);
        userManager.setAuthToken(genToken, username);
/*
        String userName = user.getUsername();
        userName = userName.replaceAll("\\\\40","@");
        String prop1 = wrapProp1(user.getProp1());
        String outstr = "\"user\": { \"email\":\""+user.getEmail()+"\", \"authToken\":\""+genToken+"\", \"username\":\""+userName+
            "\", \"name\":\""+user.getName()+"\", "+prop1+" }";
*/
        String outstr = "\"user\": { \"authToken\":\""+genToken+"\" }";
        return outstr;
    }

    public String resetResponse(String username)
            throws UserNotFoundException
    {
        User user = getUser(username);
        String genToken = RandomStringUtils.randomNumeric(7);
        userManager.setResetToken(genToken, username);
        return "\"resetToken\":\""+genToken+"\"";
    }
    public String createUser(String username, String password, String name, String email, String prop1, String groupNames)
            throws UserNotFoundException, UnauthorizedException, ConnectionException, InternalUnauthenticatedException, UserAlreadyExistsException
    {
        userManager.createUser(username, password, name, email, prop1);

        if (!empty(groupNames)) {
            Collection<Group> groups = new ArrayList<Group>();
            StringTokenizer tkn = new StringTokenizer(groupNames, ",");
            while (tkn.hasMoreTokens()) {
                try {
                    String grp = CnvUTF8(tkn.nextToken());
                    groups.add(GroupManager.getInstance().getGroup(grp));
                } catch (GroupNotFoundException e) {
                    // Ignore this group
                }
            }
            for (Group group : groups) {
                group.getMembers().add(server.createJID(username, null));
            }
        }
        AuthToken authToken = AuthFactory.authenticate(username, password);
        if (authToken == null)
        {
            return "\"httpCode\":\"401\"";
        }
        return userResponse(username, authToken);
    }
    
    public String loginUser(String username, String password)
            throws UserNotFoundException, UnauthorizedException, ConnectionException, InternalUnauthenticatedException
    {
        AuthToken authToken = AuthFactory.authenticate(username, password);
        if (authToken == null)
        {
            return "expired";
        }
        return userResponse(username, authToken);
    }

    public Boolean checkPassword(String username, String password)
            throws UserNotFoundException, UnauthorizedException, ConnectionException, InternalUnauthenticatedException
    {
        return (AuthFactory.authenticate(username, password) != null);
    }

    public String logoutUser(String username, String authToken)
            throws UserNotFoundException, UnauthorizedException, ConnectionException, InternalUnauthenticatedException
    {
        if (!removeAuthToken(authToken))
        {
            return "expired";
        }
        return "logged out";
    }
    /*
     * check if an authToken is valid
     *
     * @param String authToken
     *
     * @returns Boolean
     *
     */
    public Boolean checkAuthToken(String username, String authToken) {
        String tokenName = userManager.getAuthToken(authToken);
        if (tokenName == null)
        {
            return false;
        }
        return username.equals(tokenName);
    }

    /*
     * remove an authToken, logout
     *
     * @param String authToken
     *
     * @returns Boolean
     *
     */
    public Boolean removeAuthToken(String authToken) {
        userManager.removeAuthToken(authToken);
        return true;
    }

    /*
     * check if an resetToken is valid
     *
     * @param String resetToken
     *
     * @returns Boolean
     *
     */
    public Boolean checkResetToken(String username, String resetToken) {
        String tokenName = userManager.getResetToken(resetToken);
        if (tokenName == null)
        {
            return false;
        }
        return username.equals(tokenName);
    }

    /*
     * remove an resetToken, logout
     *
     * @param String resetToken
     *
     * @returns Boolean
     *
     */
    public Boolean removeResetToken(String resetToken) {
        userManager.removeResetToken(resetToken);
        return true;
    }

    public void deleteUser(String username) throws UserNotFoundException{
        User user = getUser(username);
        userManager.deleteUser(user);
    }

    public void validateUser(String username) throws UserNotFoundException{
        User user = getUser(username);
    }

    /**
     * Lock Out on a given username
     *
     * @param username the username of the local user to disable.
     * @throws UserNotFoundException if the requested user
     *         does not exist in the local server.
     */
    public void disableUser(String username) throws UserNotFoundException
    {
        User user = getUser(username);
        LockOutManager.getInstance().disableAccount(username, null, null);
    }

    /**
     * Remove the lockout on a given username
     *
     * @param username the username of the local user to enable.
     * @throws UserNotFoundException if the requested user
     *         does not exist in the local server.
     */
    public void enableUser(String username) throws UserNotFoundException
    {
        User user = getUser(username);
        LockOutManager.getInstance().enableAccount(username);
    }
    
    public void updateUser(String username, String password, String name, String email, String prop1, String groupNames)
            throws UserNotFoundException
    {
        User user = getUser(username);
        if (!empty(password)) user.setPassword(password);
        if (!empty(name)) user.setName(name);
        if (!empty(email)) user.setEmail(email);
        if (!empty(prop1)) user.setProp1(prop1);

        if (!empty(groupNames)) {
            Collection<Group> newGroups = new ArrayList<Group>();
            StringTokenizer tkn = new StringTokenizer(groupNames, ",");
            while (tkn.hasMoreTokens()) {
                try {
                    String grp = CnvUTF8(tkn.nextToken());
                    newGroups.add(GroupManager.getInstance().getGroup(grp));
                } catch (GroupNotFoundException e) {
                    // Ignore this group
                }
            }

            Collection<Group> existingGroups = GroupManager.getInstance().getGroups(user);
            // Get the list of groups to add to the user
            Collection<Group> groupsToAdd =  new ArrayList<Group>(newGroups);
            groupsToAdd.removeAll(existingGroups);
            // Get the list of groups to remove from the user
            Collection<Group> groupsToDelete =  new ArrayList<Group>(existingGroups);
            groupsToDelete.removeAll(newGroups);

            // Add the user to the new groups
            for (Group group : groupsToAdd) {
                group.getMembers().add(server.createJID(username, null));
            }
            // Remove the user from the old groups
            for (Group group : groupsToDelete) {
                group.getMembers().remove(server.createJID(username, null));
            }
        }
    }

    /**
     * Add new roster item for specified user
     * 
     * @param username the username of the local user to add roster item to.
     * @param itemJID the JID of the roster item to be added.
     * @param itemName the nickname of the roster item.
     * @param subscription the type of subscription of the roster item. Possible values are: -1(remove), 0(none), 1(to), 2(from), 3(both).
     * @param prop1 the type of prop1 of the roster item. contains "kana, kanjji names"
     * @param groupNames the name of a group to place contact into.
     * @throws UserNotFoundException if the user does not exist in the local server.
     * @throws UserAlreadyExistsException if roster item with the same JID already exists.
     * @throws SharedGroupException if roster item cannot be added to a shared group.
     */
    public void addRosterItem(String username, String itemJID, String itemName, String subscription, String prop1, String groupNames)
            throws UserNotFoundException, UserAlreadyExistsException, SharedGroupException
    {
        getUser(username);
        Roster r = rosterManager.getRoster(username);
        JID j = new JID(itemJID);
        try {
            r.getRosterItem(j);
            throw new UserAlreadyExistsException(j.toBareJID());
        }
        catch (UserNotFoundException e) {
            //Roster item does not exist. Try to add it.
        }
            
        if (r != null) {
            List<String> groups = new ArrayList<String>();
            if (!empty(groupNames)) {
                StringTokenizer tkn = new StringTokenizer(groupNames, ",");
                while (tkn.hasMoreTokens()) {
                    groups.add(CnvUTF8(tkn.nextToken()));
                }
            }
            else
            {
                groups = null;
            }
            RosterItem ri = r.createRosterItem(j, itemName, prop1, groups, false, true);
            if (empty(subscription)) {
                subscription = "0";
            }
            if (!empty(prop1))
            {
                ri.setProp1(prop1);
            }
            ri.setSubStatus(RosterItem.SubType.getTypeFromInt(Integer.parseInt(subscription)));
            r.updateRosterItem(ri);
        }
    }

    /**
     * Update roster item for specified user
     * 
     * @param username the username of the local user to update roster item for.
     * @param itemJID the JID of the roster item to be updated.
     * @param itemName the nickname of the roster item.
     * @param subscription the type of subscription of the roster item. Possible values are: -1(remove), 0(none), 1(to), 2(from), 3(both).
     * @param prop1 the type of prop1 of the roster item. 
     * @param groupNames the name of a group.
     * @throws UserNotFoundException if the user does not exist in the local server or roster item does not exist.
     * @throws SharedGroupException if roster item cannot be added to a shared group.
     */
    public void updateRosterItem(String username, String itemJID, String itemName, String subscription, String prop1, String groupNames)
            throws UserNotFoundException, SharedGroupException
    {
        getUser(username);
        Roster r = rosterManager.getRoster(username);
        JID j = new JID(itemJID);
        
        RosterItem ri = r.getRosterItem(j);

        if (!empty(groupNames))
        {
            List<String> groups = new ArrayList<String>();
            StringTokenizer tkn = new StringTokenizer(groupNames, ",");
            while (tkn.hasMoreTokens()) {
                groups.add(CnvUTF8(tkn.nextToken()));
            }
            ri.setGroups(groups);
        }
        
        ri.setNickname(itemName);
        if (!empty(prop1))
        {
             ri.setProp1(prop1);
        }
        
        if (empty(subscription)) {
            subscription = "0";
        }
        ri.setSubStatus(RosterItem.SubType.getTypeFromInt(Integer.parseInt(subscription)));
        r.updateRosterItem(ri);
    }

    /**
     * Delete roster item for specified user. No error returns if nothing to delete.
     * 
     * @param username the username of the local user to add roster item to.
     * @param itemJID the JID of the roster item to be deleted.
     * @throws UserNotFoundException if the user does not exist in the local server.
     * @throws SharedGroupException if roster item cannot be deleted from a shared group.
     */
    public void deleteRosterItem(String username, String itemJID)
            throws UserNotFoundException, SharedGroupException
    {
        getUser(username);
        Roster r = rosterManager.getRoster(username);
        JID j = new JID(itemJID);
        
        // No roster item is found. Uncomment the following line to throw UserNotFoundException.
        //r.getRosterItem(j);
        
        r.deleteRosterItem(j, true);
    }

    /**
     * List roster items for specified user
     * 
     * @param username the username of the local user to add roster item to.
     * @throws UserNotFoundException if the user does not exist in the local server.
     * @throws UserAlreadyExistsException if roster item with the same JID already exists.
     * @throws SharedGroupException if roster item cannot be added to a shared group.
     */
    public String getRoster(String username)
            throws UserNotFoundException, UserAlreadyExistsException, SharedGroupException
    {
        getUser(username);
        Roster r = rosterManager.getRoster(username);
        Collection<RosterItem> rosterItems = r.getRosterItems();
        StringBuilder roster = new StringBuilder("\"contacts\":[ ");
        Boolean first = true;
        for (RosterItem ri: rosterItems) {
           if (!first)
           {
              roster.append(",");
           }
           String nickName = ri.getNickname();
           if (empty(nickName))
           {
              nickName = "";
           }
           String prop1 = wrapProp1(ri.getProp1());
           List<String> groups = ri.getGroups();
           StringBuilder groupRoster = new StringBuilder("\"groups\":[ ");
           Boolean firstGroup = true;
           for (String group: groups)
           {
               if (!firstGroup)
               {
                   groupRoster.append(",");
               }
               groupRoster.append("\""+group+"\"");
               firstGroup = false;
           }
           if (firstGroup)
           {
               roster.append("{ \"name\":\""+ri.getJid()+"\", \"nickName\":\""+nickName+"\", "+prop1+" }" );
           }
           else
           {
               groupRoster.append(" ]");
               roster.append("{ \"name\":\""+ri.getJid()+"\", \"nickName\":\""+nickName+"\", "+prop1+", "+groupRoster.toString()+" }" );
           }
           first = false;
        }
        roster.append(" ]");
        return roster.toString();
    }
    private String wrapProp1(String prop1)
    {
       prop1 = prop1.trim();
       if (empty(prop1))
       {
          return "\"prop1\":{}";
       }
       return "\"prop1\":"+prop1;
    }

    /**
     * Returns the the requested user or <tt>null</tt> if there are any
     * problems that don't throw an error.
     *
     * @param username the username of the local user to retrieve.
     * @return the requested user.
     * @throws UserNotFoundException if the requested user
     *         does not exist in the local server.
     */
    private User getUser(String username) throws UserNotFoundException {
        JID targetJID = server.createJID(username, null);
        // Check that the sender is not requesting information of a remote server entity
        if (targetJID.getNode() == null) {
            // Sender is requesting presence information of an anonymous user
            throw new UserNotFoundException("Username is null");
        }
        return userManager.getUser(targetJID.getNode());
    }
    
    /**
     * Returns the secret key that only valid requests should know.
     *
     * @return the secret key.
     */
    public String getSecret() {
        return secret;
    }

    /**
     * Sets the secret key that grants permission to use the userservice.
     *
     * @param secret the secret key.
     */
    public void setSecret(String secret) {
        JiveGlobals.setProperty("plugin.userservice.secret", secret);
        this.secret = secret;
    }

    public Collection<String> getAllowedIPs() {
        return allowedIPs;
    }

    public void setAllowedIPs(Collection<String> allowedIPs) {
        JiveGlobals.setProperty("plugin.userservice.allowedIPs", StringUtils.collectionToString(allowedIPs));
        this.allowedIPs = allowedIPs;
    }

    /**
     * Returns true if the user service is enabled. If not enabled, it will not accept
     * requests to create new accounts.
     *
     * @return true if the user service is enabled.
     */
    public boolean isEnabled() {
        return enabled;
    }

    /**
     * Enables or disables the user service. If not enabled, it will not accept
     * requests to create new accounts.
     *
     * @param enabled true if the user service should be enabled.
     */
    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
        JiveGlobals.setProperty("plugin.userservice.enabled",  enabled ? "true" : "false");
    }

    public void propertySet(String property, Map<String, Object> params) {
        if (property.equals("plugin.userservice.secret")) {
            this.secret = (String)params.get("value");
        }
        else if (property.equals("plugin.userservice.enabled")) {
            this.enabled = Boolean.parseBoolean((String)params.get("value"));
        }
        else if (property.equals("plugin.userservice.allowedIPs")) {
            this.allowedIPs = StringUtils.stringToCollection((String)params.get("value"));
        }
    }

    public void propertyDeleted(String property, Map<String, Object> params) {
        if (property.equals("plugin.userservice.secret")) {
            this.secret = "";
        }
        else if (property.equals("plugin.userservice.enabled")) {
            this.enabled = false;
        }
        else if (property.equals("plugin.userservice.allowedIPs")) {
            this.allowedIPs = Collections.emptyList();
        }
    }

    public void xmlPropertySet(String property, Map<String, Object> params) {
        // Do nothing
    }

    public void xmlPropertyDeleted(String property, Map<String, Object> params) {
        // Do nothing
    }
    public Boolean empty(String s)
    {
        return (s == null) || s.equals("");
    }
    public String CnvUTF8(String poo)
    {
        // See http://www.fileformat.info/info/unicode/char/1f4a9/index.htm
        // System.out.println(poo);
        // Length of chars doesn't equals the "real" length, that is: the number of actual codepoints
        // System.out.println(poo.length() + " vs " + poo.codePointCount(0, poo.length()));
        // Iterating over all chars
        String out = "";
        for(int i=0; i<poo.length();++i) {
            char ca[] = { poo.charAt(i) };
            // If there's a char left, we chan check if the current and the next char
            // form a surrogate pair
            if(i<poo.length()-1 && Character.isSurrogatePair(ca[0], poo.charAt(i+1))) {
                // if so, the codepoint must be stored on a 32bit int as char is only 16bit
                int codePoint = poo.codePointAt(i);
                // show the code point and the char
                //out +=String.format("%6d:%s", codePoint, new String(new int[]{codePoint}, 0, 1));
                out += new String(new int[]{codePoint}, 0, 1);
            }
            // else this can only be a "normal" char
            else
            {
                //System.out.println(String.format("%6d:%s", (int)c, c));
                out += new String(ca);
            }
        }
        // constructing a string constant with two \\u unicode escape sequences
        //return "\ud83d\udca9";
        return out;
    }
}
