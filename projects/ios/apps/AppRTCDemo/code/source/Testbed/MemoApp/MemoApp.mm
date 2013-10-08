#include "Base/package.h"

#include "package.h"

MemoApp gMemoApp;

#pragma mark Constructor / Destructor
MemoApp::MemoApp()
:   mScreen(NULL)
{
	ConstructMachine();
}

MemoApp::~MemoApp()
{
	DestructMachine();
}

#pragma mark Start / End / Invalid
void MemoApp::startEntry()
{
    MemoEventManager::getInstance()->attach(this);
}

void MemoApp::endEntry()
{
    if (mScreen) { delete mScreen; mScreen = NULL; }
}

void MemoApp::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Screens

void MemoApp::hideAllViewsEntry()
{
    [gAppDelegateInstance hideAllViews];
}

void MemoApp::startScreenEntry()
{
    [gAppDelegateInstance setStartScreenVisible:true];
}

void MemoApp::startScreenExit()
{
    [gAppDelegateInstance setStartScreenVisible:false];
}

void MemoApp::signingInScreenEntry()
{
    [gAppDelegateInstance setSigningInScreenVisible:true];
    process(kSuccess);
}

void MemoApp::signingInScreenExit()
{
    [gAppDelegateInstance setSigningInScreenVisible:false];
}

void MemoApp::myInboxScreenEntry()
{
    [gAppDelegateInstance setMyInboxScreenVisible:true];
}

void MemoApp::myInboxScreenExit()
{
    [gAppDelegateInstance setMyInboxScreenVisible:false];
}

void MemoApp::recordAudioScreenEntry()
{
    mScreen = new RecordAudioScreen;
    mScreen->attach(this);
}

void MemoApp::recordAudioScreenExit()
{
    if (mScreen) { delete mScreen; mScreen = NULL; }
}

void MemoApp::myRecordingsScreenEntry()
{
    mScreen = new MyRecordingsScreen;
    mScreen->attach(this);
}

void MemoApp::myRecordingsScreenExit()
{
    if (mScreen) { delete mScreen; mScreen = NULL; }
}

void MemoApp::sendToGroupScreenEntry()
{
    [gAppDelegateInstance setSendToGroupScreenVisible:true];
}

void MemoApp::sendToGroupScreenExit()
{
    [gAppDelegateInstance setSendToGroupScreenVisible:false];
}

void MemoApp::playAudioScreenEntry()
{
    mScreen = new PlayAudioScreen(mCurAudioFilename);
    mScreen->attach(this);
}

void MemoApp::playAudioScreenExit()
{
    if (mScreen) { delete mScreen; mScreen = NULL; }
}

#pragma mark State wiring
void MemoApp::CallEntry()
{
	switch(mState)
	{
		case kEnd: EndEntryHelper(); break;
		case kHideAllViews: hideAllViewsEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kMyInboxScreen: myInboxScreenEntry(); break;
		case kMyRecordingsScreen: myRecordingsScreenEntry(); break;
		case kPlayAudioScreen: playAudioScreenEntry(); break;
		case kRecordAudioScreen: recordAudioScreenEntry(); break;
		case kSendToGroupScreen: sendToGroupScreenEntry(); break;
		case kSigningInScreen: signingInScreenEntry(); break;
		case kStart: startEntry(); break;
		case kStartScreen: startScreenEntry(); break;
		default: break;
	}
}

void MemoApp::CallExit()
{
	switch(mState)
	{
		case kMyInboxScreen: myInboxScreenExit(); break;
		case kMyRecordingsScreen: myRecordingsScreenExit(); break;
		case kPlayAudioScreen: playAudioScreenExit(); break;
		case kRecordAudioScreen: recordAudioScreenExit(); break;
		case kSendToGroupScreen: sendToGroupScreenExit(); break;
		case kSigningInScreen: signingInScreenExit(); break;
		case kStartScreen: startScreenExit(); break;
		default: break;
	}
}

int  MemoApp::StateTransitionFunction(const int evt) const
{
	if ((mState == kHideAllViews) && (evt == kNext)) return kMyRecordingsScreen; else
	if ((mState == kMyInboxScreen) && (evt == kGoNewRecording)) return kRecordAudioScreen; else
	if ((mState == kMyInboxScreen) && (evt == kGoPlay)) return kPlayAudioScreen; else
	if ((mState == kMyInboxScreen) && (evt == kGoRecordings)) return kMyRecordingsScreen; else
	if ((mState == kMyRecordingsScreen) && (evt == kGoInbox)) return kMyInboxScreen; else
	if ((mState == kMyRecordingsScreen) && (evt == kGoNewRecording)) return kRecordAudioScreen; else
	if ((mState == kMyRecordingsScreen) && (evt == kGoPlay)) return kPlayAudioScreen; else
	if ((mState == kPlayAudioScreen) && (evt == kGoInbox)) return kMyInboxScreen; else
	if ((mState == kPlayAudioScreen) && (evt == kGoRecordings)) return kMyRecordingsScreen; else
	if ((mState == kPlayAudioScreen) && (evt == kGoSendGroup)) return kSendToGroupScreen; else
	if ((mState == kRecordAudioScreen) && (evt == kGoInbox)) return kMyInboxScreen; else
	if ((mState == kRecordAudioScreen) && (evt == kGoPlay)) return kPlayAudioScreen; else
	if ((mState == kRecordAudioScreen) && (evt == kGoRecordings)) return kMyRecordingsScreen; else
	if ((mState == kSendToGroupScreen) && (evt == kGoInbox)) return kMyInboxScreen; else
	if ((mState == kSigningInScreen) && (evt == kFail)) return kStartScreen; else
	if ((mState == kSigningInScreen) && (evt == kSuccess)) return kMyInboxScreen; else
	if ((mState == kStart) && (evt == kReady)) return kHideAllViews; else
	if ((mState == kStartScreen) && (evt == kSignin)) return kSigningInScreen;

	return kInvalidState;
}

bool MemoApp::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kHideAllViews:
			return true;
		default: break;
	}
	return false;
}

#pragma mark Messages
void MemoApp::update(const MemoEvent& msg)
{
    switch (msg.mEvent)
    {
        case MemoEvent::kAppDelegateInit:   process(kReady); break;
        case MemoEvent::kSignInPressed:     process(kSignin); break;

        case MemoEvent::kInboxTabPressed:
            if (getState() != kMyInboxScreen)
            {
                process(kGoInbox);
            }
            break;

        case MemoEvent::kMemosTabPressed:
            if (getState() != kMyRecordingsScreen)
            {
                process(kGoRecordings);
            }
            break;

        case MemoEvent::kNewMemoTabPressed:
            if (getState() != kRecordAudioScreen)
            {
                process(kGoNewRecording);
            }
            break;

        default:
            break;
    }
}

void MemoApp::update(const MemoAppMessage& msg)
{
    switch (msg.mEvent)
    {
        case MemoApp::kGoPlay: mCurAudioFilename = msg.mAudioFilename; break;

        default:
            break;
    }

	process(msg.mEvent);
}

