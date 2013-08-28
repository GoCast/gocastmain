#include "Base/package.h"

#include "AudioDemo.h"

#include "AppDelegate.h"

AudioDemo gAudioDemo;
extern AppDelegate* gAppDelegateInstance;
extern UIWebView*   gWebViewInstance;

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

