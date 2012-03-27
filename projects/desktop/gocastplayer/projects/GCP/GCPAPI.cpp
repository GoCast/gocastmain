/**********************************************************\

  Auto-generated GCPAPI.cpp

\**********************************************************/

#include "JSObject.h"
#include "variant_list.h"
#include "DOM/Document.h"
#include "global/config.h"

#include "GCPAPI.h"

///////////////////////////////////////////////////////////////////////////////
/// @fn FB::variant GCPAPI::echo(const FB::variant& msg)
///
/// @brief  Echos whatever is passed from Javascript.
///         Go ahead and change it. See what happens!
///////////////////////////////////////////////////////////////////////////////
FB::variant GCPAPI::echo(const FB::variant& msg)
{
    static int n(0);
    fire_echo("So far, you clicked this many times: ", n++);

    // return "foobar";
    return msg;
}

///////////////////////////////////////////////////////////////////////////////
/// @fn GCPPtr GCPAPI::getPlugin()
///
/// @brief  Gets a reference to the plugin that was passed in when the object
///         was created.  If the plugin has already been released then this
///         will throw a FB::script_error that will be translated into a
///         javascript exception in the page.
///////////////////////////////////////////////////////////////////////////////
GCPPtr GCPAPI::getPlugin()
{
    GCPPtr plugin(m_plugin.lock());
    if (!plugin) {
        throw FB::script_error("The plugin is invalid");
    }
    return plugin;
}

// Read/Write property testString
std::string GCPAPI::get_testString()
{
    return m_testString;
}

void GCPAPI::set_testString(const std::string& val)
{
    m_testString = val;
}

// Read-only property version
std::string GCPAPI::get_version()
{
    return FBSTRING_PLUGIN_VERSION;
}

void GCPAPI::testEvent()
{
    fire_test();
}

FB::variant GCPAPI::InitLocalResources(const std::string& stunIP,
                                       const int stunPort,
                                       FB::JSObjectPtr pSuccCallback,
                                       FB::JSObjectPtr pFailCallback)
{
    boost::mutex::scoped_lock lock_(GCP::deqMutex);
    GCP::stunIP = stunIP;
    GCP::stunPort = stunPort;
    GCP::successCallback = pSuccCallback;
    GCP::failureCallback = pFailCallback;
    (GCP::wrtInstructions).push_back(WEBRTC_RESOURCES_INIT);
    return true;
}

FB::variant GCPAPI::DeinitLocalResources()
{
    boost::mutex::scoped_lock lock_(GCP::deqMutex);
    (GCP::wrtInstructions).push_back(WEBRTC_RESOURCES_DEINIT);
    return true;
}

FB::variant GCPAPI::StartLocalVideo()
{
    boost::mutex::scoped_lock lock_(GCP::deqMutex);
    (GCP::wrtInstructions).push_back(START_LOCAL_VIDEO);
    return true;
}

FB::variant GCPAPI::StopLocalVideo()
{
    boost::mutex::scoped_lock lock_(GCP::deqMutex);
    (GCP::wrtInstructions).push_back(STOP_LOCAL_VIDEO);
    return true;
}
