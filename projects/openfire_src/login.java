import org.jivesoftware.admin.AdminConsole;
import org.jivesoftware.openfire.admin.AdminManager;
import org.jivesoftware.openfire.clearspace.ClearspaceManager;
import org.jivesoftware.openfire.cluster.ClusterManager;
import org.jivesoftware.openfire.container.AdminConsolePlugin;
import org.xmpp.packet.JID;
import org.jivesoftware.openfire.auth.*;
import java.util.HashMap;
import java.util.Map;
import org.jivesoftware.util.*;
import org.jivesoftware.admin.LoginLimitManager;
/* Define Administration Bean */
import org.jivesoftware.util.WebManager;
class Login {
Webmanager admin = new WebManager();

function Login()
{
    admin.init(request, response, session, application, out );

 // get parameters
    String username = ParamUtils.getParameter(request, "username");

    String password = ParamUtils.getParameter(request, "password");
    String url = ParamUtils.getParameter(request, "url");
    url = org.jivesoftware.util.StringUtils.escapeHTMLTags(url);

    // SSO between cluster nodes
    String secret = ParamUtils.getParameter(request, "secret");
    String nodeID = ParamUtils.getParameter(request, "nodeID");
    String nonce = ParamUtils.getParameter(request, "nonce");

    // The user auth token:
    AuthToken authToken = null;

    // Check the request/response for a login token

    Map<String, String> errors = new HashMap<String, String>();

    if (ParamUtils.getBooleanParameter(request, "login")) {
        String loginUsername = username;
        if (loginUsername != null) {
            loginUsername = JID.escapeNode(loginUsername);
        }
        try {
            if (secret != null && nodeID != null) {
                if (StringUtils.hash(AdminConsolePlugin.secret).equals(secret) && ClusterManager.isClusterMember(Base64.decode(nodeID, Base64.URL_SAFE))) {
                    authToken = new AuthToken(loginUsername);
                }
                else if ("clearspace".equals(nodeID) && ClearspaceManager.isEnabled()) {
                    ClearspaceManager csmanager = ClearspaceManager.getInstance();
                    String sharedSecret = csmanager.getSharedSecret();
                    if (nonce == null || sharedSecret == null || !csmanager.isValidNonce(nonce) ||
                            !StringUtils.hash(loginUsername + ":" + sharedSecret + ":" + nonce).equals(secret)) {
                        throw new UnauthorizedException("SSO failed. Invalid secret was provided");
                    }
                    authToken = new AuthToken(loginUsername);
                }
                else {
                    throw new UnauthorizedException("SSO failed. Invalid secret or node ID was provided");
                }
            }
            else {
                // Check that a username was provided before trying to verify credentials
                if (loginUsername != null) {
                    if (LoginLimitManager.getInstance().hasHitConnectionLimit(loginUsername, request.getRemoteAddr())) {
                        throw new UnauthorizedException("User '" + loginUsername +"' or address '" + request.getRemoteAddr() + "' has his login attempt limit.");
                    }
                    if (!AdminManager.getInstance().isUserAdmin(loginUsername, true)) {
                        throw new UnauthorizedException("User '" + loginUsername + "' not allowed to login.");
                    }
                    authToken = AuthFactory.authenticate(loginUsername, password);
                }
                else {
                    errors.put("unauthorized", LocaleUtils.getLocalizedString("login.failed.unauthorized"));
                }
            }
            if (errors.isEmpty()) {
                LoginLimitManager.getInstance().recordSuccessfulAttempt(loginUsername, request.getRemoteAddr());
                session.setAttribute("jive.admin.authToken", authToken);
                response.sendRedirect(go(url));
                return;
            }
        }
        catch (ConnectionException ue) {
            Log.debug(ue);
            if (ClearspaceManager.isEnabled()) {
                if (session.getAttribute("prelogin.setup.error.firstTime.connection") != null) {
                    session.removeAttribute("prelogin.setup.error.firstTime.connection");
                    session.setAttribute("prelogin.setup.error", "prelogin.setup.error.clearspace.connection");
                    session.setAttribute("prelogin.setup.sidebar", "true");
                    session.setAttribute("prelogin.setup.sidebar.title", "prelogin.setup.sidebar.title.clearspace");
                    session.setAttribute("prelogin.setup.sidebar.link", "clearspace-integration-prelogin.jsp");
                    response.sendRedirect(go("setup/clearspace-integration-prelogin.jsp"));
                } else {
                   session.setAttribute("prelogin.setup.error.firstTime.connection", true);
                   errors.put("connection", LocaleUtils.getLocalizedString("login.failed.connection.clearspace"));
                }
            } else {
                errors.put("connection", LocaleUtils.getLocalizedString("login.failed.connection"));
            }
        }
        catch (InternalUnauthenticatedException ue) {
            Log.debug(ue);
            if (ClearspaceManager.isEnabled()) {
                if (session.getAttribute("prelogin.setup.error.firstTime.sharedsecret") != null) {
                    session.removeAttribute("prelogin.setup.error.firstTime.sharedsecret");
                    session.setAttribute("prelogin.setup.error", "prelogin.setup.error.clearspace.sharedsecret");
                    session.setAttribute("prelogin.setup.sidebar", "true");
                    session.setAttribute("prelogin.setup.sidebar.title", "prelogin.setup.sidebar.title.clearspace");
                    session.setAttribute("prelogin.setup.sidebar.link", "clearspace-integration-prelogin.jsp");
                    response.sendRedirect(go("setup/clearspace-integration-prelogin.jsp"));
                } else {
                   session.setAttribute("prelogin.setup.error.firstTime.sharedsecret", true); 
                   errors.put("authentication", LocaleUtils.getLocalizedString("login.failed.authentication.clearspace"));
                }
            } else {
                errors.put("authentication", LocaleUtils.getLocalizedString("login.failed.authentication"));
            }
        }
        catch (UnauthorizedException ue) {
            Log.debug(ue);
            LoginLimitManager.getInstance().recordFailedAttempt(username, request.getRemoteAddr());
            errors.put("unauthorized", LocaleUtils.getLocalizedString("login.failed.unauthorized"));
        }
    }

    // Escape HTML tags in username to prevent cross-site scripting attacks. This
    // is necessary because we display the username in the page below.
    username = org.jivesoftware.util.StringUtils.escapeHTMLTags(username);
}
