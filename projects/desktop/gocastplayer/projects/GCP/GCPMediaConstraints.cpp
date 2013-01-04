#include "GCPMediaConstraints.h"
#include "GCPMediaStream.h"

namespace GoCast
{
    MediaConstraints::MediaConstraints(const FB::JSObjectPtr& constraints)
    {
        if(true == constraints->HasProperty("webrtc"))
        {
            FB::JSObjectPtr webrtcconstraints = constraints->GetProperty("webrtc").convert_cast<FB::JSObjectPtr>();
            if(NULL != webrtcconstraints.get())
            {
                if(true == webrtcconstraints->HasProperty("mandatory"))
                {
                    FB::JSObjectPtr mandatory = webrtcconstraints->GetProperty("mandatory").convert_cast<FB::JSObjectPtr>();
                    
                    if(NULL != mandatory.get())
                    {
                        std::vector<std::string> constraintNames;
                        mandatory->getMemberNames(constraintNames);
                        
                        for(std::vector<std::string>::iterator it = constraintNames.begin();
                            it != constraintNames.end(); it++)
                        {
                            std::stringstream sstrm;
                            sstrm << "Mandatory Constraint: [" << *it << ", " << mandatory->GetProperty(*it).convert_cast<std::string>() << "]";
                            FBLOG_INFO_CUSTOM("MediaConstraints", sstrm.str());
                            m_mandatory.push_back(webrtc::MediaConstraintsInterface::Constraint(*it,
                                                  mandatory->GetProperty(*it).convert_cast<std::string>()));
                        }
                    }
                }
            }
        }
    }

    MediaConstraints::~MediaConstraints()
    {
        m_mandatory.clear();
        m_optional.clear();
    }

    const webrtc::MediaConstraintsInterface::Constraints& MediaConstraints::GetMandatory() const
    {
        return m_mandatory;
    }

    const webrtc::MediaConstraintsInterface::Constraints& MediaConstraints::GetOptional() const
    {
        return m_optional;
    }
}