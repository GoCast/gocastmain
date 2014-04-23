/**
 * $RCSfile$
 * $Revision: 1710 $
 * $Date: 2005-07-26 11:56:14 -0700 (Tue, 26 Jul 2005) $
 *
 * Copyright (C) 2004-2008 Jive Software. All rights reserved.
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

package org.jivesoftware.openfire.plugin.userService;

import gnu.inet.encoding.Stringprep;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.jivesoftware.admin.AuthCheckFilter;
import org.jivesoftware.openfire.SharedGroupException;
import org.jivesoftware.openfire.XMPPServer;
import org.jivesoftware.openfire.plugin.UserServicePlugin;
import org.jivesoftware.openfire.user.UserAlreadyExistsException;
import org.jivesoftware.openfire.user.UserNotFoundException;
import org.jivesoftware.openfire.auth.UnauthorizedException;
import org.jivesoftware.openfire.SessionManager;
import org.jivesoftware.util.Log;
import org.xmpp.packet.JID;


/**
 * Servlet that addition/deletion/modification of the users info in the system.
 * Use the <b>type</b>
 * parameter to specify the type of action. Possible values are <b>add</b>,<b>delete</b> and
 * <b>update</b>. <p>
 * <p/>
 * The request <b>MUST</b> include the <b>secret</b> parameter. This parameter will be used
 * to authenticate the request. If this parameter is missing from the request then
 * an error will be logged and no action will occur.
 *
 * @author Justin Hunt
 */
public class UserServiceServlet extends HttpServlet {

    private UserServicePlugin plugin;
    private String contentType;

    @Override
	public void init(ServletConfig servletConfig) throws ServletException {
        super.init(servletConfig);
        plugin = (UserServicePlugin) XMPPServer.getInstance().getPluginManager().getPlugin("userservice");
 
        // Exclude this servlet from requiring the user to login
        AuthCheckFilter.addExclude("userService/userservice");
    }

    @Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException
    {
        // Printwriter for writing out responses to browser
        PrintWriter out = response.getWriter();

        if (!plugin.getAllowedIPs().isEmpty()) {
            // Get client's IP address
            String ipAddress = request.getHeader("x-forwarded-for");
            if (ipAddress == null) {
                ipAddress = request.getHeader("X_FORWARDED_FOR");
                if (ipAddress == null) {
                    ipAddress = request.getHeader("X-Forward-For");
                    if (ipAddress == null) {
                        ipAddress = request.getRemoteAddr();
                    }
                }
            }
            if (!plugin.getAllowedIPs().contains(ipAddress)) {
                Log.warn("User service rejected service to IP address: " + ipAddress);
                replyError("RequestNotAuthorised",null,response, out);
                return;
            }
        }
        contentType = request.getHeader("Content-type");

        String username = request.getParameter("username");
        String password = request.getParameter("password");
        String oldPassword = request.getParameter("oldPassword");
        String name = request.getParameter("name");
        String kana = request.getParameter("kana");
        String kanji = request.getParameter("kanji");
        String email = request.getParameter("email");
        String type = request.getParameter("type");
        String secret = request.getParameter("secret");
        String groupNames = request.getParameter("groups");
        String item_jid = request.getParameter("item_jid");
        String sub = request.getParameter("subscription");
        String authToken = request.getParameter("authToken");
        String resetToken = request.getParameter("resetToken");
        //No defaults, add, delete, update only
        //type = type == null ? "image" : type;
       
        // Check that our plugin is enabled.
        if (!plugin.isEnabled()) {
            Log.warn("User service plugin is disabled: " + request.getQueryString());
            replyError("UserServiceDisabled",null,response, out);
            return;
        }
       
        // Check this request is authorised
        if (secret == null || !secret.equals(plugin.getSecret())){
            Log.warn("An unauthorised user service request was received: " + request.getQueryString());
            replyError("RequestNotAuthorised",null,response, out);
            return;
         }

        // Some checking is required on the username
        if (username == null){
            replyError("IllegalArgumentException:username=null",null,response, out);
            return;
        }

        if ((type.equals("add_roster") || type.equals("update_roster") || type.equals("delete_roster")) &&
        	(item_jid == null || !(sub == null || sub.equals("-1") || sub.equals("0") ||
        	sub.equals("1") || sub.equals("2") || sub.equals("3")))) {
            replyError("IllegalArgumentException:type"+type+":item_jid:"+item_jid+":sub:"+sub,null,response, out);
            return;
        }

        // Check the request type and process accordingly
        try {
            username = username.trim().toLowerCase();
            username = JID.escapeNode(username);
            username = Stringprep.nodeprep(username);
            SessionManager sm = SessionManager.getInstance();
            //Log.error("SESSION COUNT:"+sm.getSessionCount(username));
            if ("login".equals(type)) {
                String userStr = plugin.loginUser(username, password);
                replyMessage(replyStatus("ok")+", "+userStr,response,out);
                //xmlProvider.sendInfo(request, response, presence);
            }
            else if ("validate".equals(type)) {
                plugin.validateUser(username);
                replyMessage(replyStatus("ok"),response,out);
                //xmlProvider.sendInfo(request, response, presence);
            }
            else if ("add".equals(type)) {
                String prop1 = makeProp1(kana, kanji);
                String userStr=plugin.createUser(username, password, name, email, prop1, groupNames);
                replyMessage(replyStatus("ok")+", "+userStr,response, out);
                //imageProvider.sendInfo(request, response, presence);
            }
            else if (plugin.checkAuthToken(username,authToken)) {
                if ("logout".equals(type)) {
                    String userStr = plugin.logoutUser(username, authToken);
                    replyMessage(replyStatus(userStr),response,out);
                    //xmlProvider.sendInfo(request, response, presence);
                }
                else if ("delete".equals(type)) {
                    plugin.deleteUser(username);
                    replyMessage(replyStatus("ok"),response,out);
                    //xmlProvider.sendInfo(request, response, presence);
                }
                else if ("enable".equals(type)) {
                    plugin.enableUser(username);
                    replyMessage(replyStatus("ok"),response,out);
                }
                else if ("disable".equals(type)) {
                    plugin.disableUser(username);
                    replyMessage(replyStatus("ok"),response,out);
                }
                else if ("update".equals(type)) {
                    String prop1 = makeProp1(kana, kanji);
                    plugin.updateUser(username, password,name,email,prop1,groupNames);
                    replyMessage(replyStatus("ok"),response,out);
                    //xmlProvider.sendInfo(request, response, presence);
                }
                else if ("changePassword".equals(type)) {
                    if (plugin.checkPassword(username, oldPassword))
                    {
                        plugin.updateUser(username, password,null,null,null,null);
                        replyMessage(replyStatus("ok"),response,out);
                    }
                    else
                    {
                        replyExpired("User not Authorized",response, out);
                    }
                    //xmlProvider.sendInfo(request, response, presence);
                }
                else if ("resetPassword".equals(type)) {
                    if (plugin.checkResetToken(username,resetToken)) {
                        plugin.removeResetToken(resetToken);
                        plugin.updateUser(username, password,null,null,null,null);
                        replyMessage(replyStatus("ok"),response,out);
                    }
                    else
                    {
                        plugin.removeResetToken(resetToken);
                        replyExpired("User not Authorized",response, out);
                    }
                    //xmlProvider.sendInfo(request, response, presence);
                }
                else if ("resetToken".equals(type)) {
                    String resetJson = plugin.resetResponse(username);
                    replyMessage(replyStatus("ok")+", "+resetJson,response,out);
                    //xmlProvider.sendInfo(request, response, presence);
                }
                else if ("add_roster".equals(type)) {
                    String prop1 = makeProp1(kana, kanji);
                    plugin.addRosterItem(username, "contact___"+item_jid, name, sub, prop1, null);
                    replyMessage(replyStatus("ok"),response, out);
                }
                else if ("update_roster".equals(type)) {
                    String prop1 = makeProp1(kana, kanji);
                    plugin.updateRosterItem(username, "contact___"+item_jid, name, sub, prop1, null);
                    replyMessage(replyStatus("ok"),response, out);
                }
                else if ("delete_roster".equals(type)) {
                    plugin.deleteRosterItem(username, "contact___"+item_jid);
                    replyMessage(replyStatus("ok"),response, out);
                }
                else if ("add_groups".equals(type)) {
                    plugin.addRosterItem(username, "group___"+item_jid, name, sub, null, groupNames);
                    replyMessage(replyStatus("ok"),response, out);
                }
                else if ("update_groups".equals(type)) {
                    plugin.updateRosterItem(username, "group___"+item_jid, name, sub, null, groupNames);
                    replyMessage(replyStatus("ok"),response, out);
                }
                else if ("delete_groups".equals(type)) {
                    plugin.updateRosterItem(username, "group___"+item_jid, name, sub, null, "");
                    replyMessage(replyStatus("ok"),response, out);
                }
                else if ("get_roster".equals(type)) {
                    String roster=plugin.getRoster(username);
                    replyMessage(replyStatus("ok")+","+roster,response, out);
                }
                else if ("authorize".equals(type)) {
                    replyMessage(replyStatus("ok"),response, out);
                }
                else {
                    Log.error("The userService servlet received an invalid request of type: " + type +":authToken:"+authToken);
                    replyMessage(replyStatus("fail"),response, out);
                    // TODO Do something
                }
            }
            else
            {
                replyExpired("User not Authorized",response, out);
		Log.error("User not Authorized"+username+":"+authToken);
                // TODO Do something
            }
        }
        catch (UserAlreadyExistsException e) {
            replyError("UserAlreadyExistsException:",e,response, out);
        }
        catch (UserNotFoundException e) {
            //replyError("UserNotFoundException:",e,response, out);
            replyExpired("User not Authorized",response, out);
        }
        catch (UnauthorizedException e) {
            //replyError("UnauthorizedException",e,response, out);
            replyExpired("User not Authorized",response, out);
        }
        catch (IllegalArgumentException e) {
            replyError("IllegalArgumentException:",e,response, out);
        }
        catch (SharedGroupException e) {
            replyError("SharedGroupException:",e,response, out);
        }
        catch (Exception e) {
            replyError(e.getMessage(),null,response, out);
        }
    }
    private String replyStatus(String status)
    {
        if ("application/json".equals(contentType))
        {
            return '"'+status+'"';
        }
        return status;
    }

    private void replyMessage(String message,HttpServletResponse response, PrintWriter out){
        if ("application/json".equals(contentType))
        {
           response.setContentType("application/json");
           out.print("{ \"status\":\"success\", \"message\":"+message+" }");
        }
        else
        {
           response.setContentType("text/xml");
           out.println("<result>" + message + "</result>");
        }
        out.flush();
    }

    private void replyExpired(String message,HttpServletResponse response, PrintWriter out){
        if ("application/json".equals(contentType))
        {
           response.setContentType("application/json");
           out.print("{ \"status\":\"expired\", \"message\":\""+message+"\" }");
        }
        else
        {
           response.setContentType("text/xml");
           out.println("<result>" + message + "</result>");
        }
        out.flush();
    }

    private void replyError(String error,Exception e,HttpServletResponse response, PrintWriter out){
        if (e != null)
        {
             if (e.getMessage() != null)
             {
                   error += e.getMessage();
             }
        }
        if ("application/json".equals(contentType))
        {
           response.setContentType("application/json");
           out.print("{ \"status\":\"fail\",\"message\":\""+error+"\" }");
        }
        else
        {
           response.setContentType("text/xml");        
           out.println("<error>" + error + "</error>");
        }
        out.flush();
        Log.error("ERROR:"+error);
    }
    protected String makeProp1(String kana, String kanji)
    {
        if (plugin.empty(kana))
        {
            kana = "";
        }
        if (plugin.empty(kanji))
        {
            kanji = "";
        }
        return "{ \"kana\":\""+plugin.CnvUTF8(kana)+"\", \"kanji\":\""+plugin.CnvUTF8(kanji)+"\" }";
    }

    @Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        doGet(request, response);
    }

    @Override
	public void destroy() {
        super.destroy();
        // Release the excluded URL
        AuthCheckFilter.removeExclude("userService/userservice");
    }
}
