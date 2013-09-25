#include "Base/package.h"

#include "package.h"
#include "AppDelegate.h"

ErizoApp gApp;
extern AppDelegate* gAppDelegateInstance;

#pragma mark Constructor / Destructor
ErizoApp::ErizoApp()
: mFirstTime(true)
{
    GUIEventManager::getInstance()->attach(this);
}

ErizoApp::~ErizoApp()
{

}

void ErizoApp::update(const GUIEvent& msg)
{
    switch (msg.mEvent)
    {
        case GUIEvent::kGoPressed:
            if (mFirstTime)
            {
                mFirstTime = false;
                mClient.startClient("abc", "");
//                mClient.startClient([gAppDelegateInstance getScreenName], [gAppDelegateInstance getRoomID]);
            }
            break;

        case GUIEvent::kRoomIDUpdate:
            [gAppDelegateInstance setRoomID:msg.mRoomID];
            break;

        default:
            break;
    }
}

