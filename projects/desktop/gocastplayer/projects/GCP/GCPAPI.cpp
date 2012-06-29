/**********************************************************\

  Auto-generated GCPAPI.cpp

\**********************************************************/

#include "JSObject.h"
#include "variant_list.h"
#include "DOM/Document.h"
#include "global/config.h"

#include <iostream>
#include "GCPAPI.h"
#include "GCPWebrtcCenter.h"

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

// Read-only property version
std::string GCPAPI::get_version()
{
    return FBSTRING_PLUGIN_VERSION;
}

void GCPAPI::GetUserMedia(const FB::JSObjectPtr& mediaHints,
                          const FB::JSObjectPtr& succCb,
                          const FB::JSObjectPtr& failCb)
{
    std::cout << "GCPAPI::GetUserMedia..." << std::endl;
    GoCast::RtcCenter* pCtr = GoCast::RtcCenter::Instance();
    
    if(NULL == pCtr)
    {
        failCb->InvokeAsync("", FB::variant_list_of("RtcCenter init failed"));
        return;
    }
    
    pCtr->GetUserMedia(mediaHints, succCb, failCb);
}
