#include "Base/package.h"

#include "AudioDemo.h"

#include "AppDelegate.h"

#include "HUDEvent.h"
#include "HUDEventManager.h"

#include "GCIStack.h"

AudioDemo gAudioDemo;
extern AppDelegate* gAppDelegateInstance;
extern UIWebView*   gWebViewInstance;
extern GCIStack*    gStackInstance;

#pragma mark Constructor / Destructor
AudioDemo::AudioDemo()
{
	ConstructMachine();
}

AudioDemo::~AudioDemo()
{
	DestructMachine();
}

#pragma mark Start / End / Invalid
void AudioDemo::startEntry()
{
    [[[GCIStack alloc] init] autorelease];
    HUDEventManager::getInstance()->attach(this);
}

void AudioDemo::endEntry()
{
}

void AudioDemo::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Actions

void AudioDemo::showWebLoadingViewEntry()
{
    [gAppDelegateInstance showWebLoadingView];
}

void AudioDemo::showWebLoadingViewExit()
{
    [gAppDelegateInstance hideWebLoadingView];
}

void AudioDemo::showLoginViewEntry()
{
//    [gAppDelegateInstance showLoginView];
}

void AudioDemo::showLoginViewExit()
{
//    [gAppDelegateInstance hideLoginView];

    [gWebViewInstance stringByEvaluatingJavaScriptFromString: [NSString stringWithFormat:@"startCallcast('%s','%s')", "username", "roomname"]];
}

#pragma mark State wiring
void AudioDemo::CallEntry()
{
	switch(mState)
	{
		case kEnd: EndEntryHelper(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kShowLoginView: showLoginViewEntry(); break;
		case kShowWebLoadingView: showWebLoadingViewEntry(); break;
		case kStart: startEntry(); break;
		default: break;
	}
}

void AudioDemo::CallExit()
{
	switch(mState)
	{
		case kShowLoginView: showLoginViewExit(); break;
		case kShowWebLoadingView: showWebLoadingViewExit(); break;
		default: break;
	}
}

int  AudioDemo::StateTransitionFunction(const int evt) const
{
	if ((mState == kShowWebLoadingView) && (evt == kWebViewLoaded)) return kShowLoginView; else
	if ((mState == kStart) && (evt == kNext)) return kShowWebLoadingView;

	return kInvalidState;
}

bool AudioDemo::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kStart:
			return true;
		default: break;
	}
	return false;
}

#pragma mark Messages
void AudioDemo::update(const AudioDemoMessage& msg)
{
	process(msg.mEvent);
}

void AudioDemo::update(const HUDEvent& msg)
{
    switch (msg.mEvent)
    {
        case HUDEvent::kGoPressed:
            {
                std::string screenName  = [gAppDelegateInstance getScreenName];
                std::string roomID      = [gAppDelegateInstance getRoomID];

                char outCall[1024];

                if (!screenName.empty())
                {
                    if (!roomID.empty())
                    {
                        sprintf(outCall, "ManjeshClient(document, 'http://localhost/?%s_%s', '%s_%s' || '', Erizo);",
                                screenName.c_str(), roomID.c_str(),
                                screenName.c_str(), roomID.c_str());
                    }
                    else
                    {
                        sprintf(outCall, "ManjeshClient(document, 'http://localhost/?%s', '%s' || '', Erizo);",
                                screenName.c_str(), screenName.c_str());
                    }

                    [gAppDelegateInstance setGoButtonEnabled:false];

                    [gWebViewInstance stringByEvaluatingJavaScriptFromString: [NSString stringWithFormat:@"%s", outCall]];
                }
                else
                {
                    tAlert("Please enter a screen name.");
                }
            }
            break;

        case HUDEvent::kSetRoomID:
            [gAppDelegateInstance setRoomID:msg.mRoomID];
            break;

        case HUDEvent::kPCConstruct:
            [gStackInstance pcConstruct:msg.mRTCConfig];
            break;

        default:
            break;
    }
}

