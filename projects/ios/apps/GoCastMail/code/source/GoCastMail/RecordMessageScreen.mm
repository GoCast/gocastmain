#include "Base/package.h"
#include "Io/package.h"
#include "Audio/package.h"

#include "package.h"

#include "RecordMessageVC.h"

#define kScreenName "RecordMessage"

#pragma mark Constructor / Destructor
RecordMessageScreen::RecordMessageScreen(RecordMessageVC* newVC, const JSONObject& initObject)
:   mPeer(newVC),
    mInitObject(initObject),
    mGotTranscriptionEvent(false)
{
	ConstructMachine();
}

RecordMessageScreen::~RecordMessageScreen()
{
	DestructMachine();
}

#pragma mark Public methods
void RecordMessageScreen::recordPressed()
{
}

void RecordMessageScreen::composePressed()
{
}

void RecordMessageScreen::readPressed()
{
}

#pragma mark Start / End / Invalid
void RecordMessageScreen::startEntry()
{
    mMessage        = [mPeer getMessage];

    mSound          = NULL;
    mNewMessage                 = NULL;
    mBeginRecordingIndicator    = NULL;
    mEndRecordingIndicator      = NULL;
    mDidRecord      = false;

    GCTEventManager::getInstance()->attach(this);
    URLLoader::getInstance()->attach(this);

    mSliderUpdateTimer = new tTimer(30);
    mSliderUpdateTimer->attach(this);

    mRecordTimer = new tTimer(1000);
    mRecordTimer->attach(this);

    mNewMessage                 = new tSound(tFile(tFile::kBundleDirectory, "newmessage.wav"));
    mBeginRecordingIndicator    = new tSound(tFile(tFile::kBundleDirectory, "begin_record.caf"));
    mEndRecordingIndicator      = new tSound(tFile(tFile::kBundleDirectory, "end_record.caf"));

    mBeginRecordingIndicator->attach(this);
    mNewMessage->attach(this);
}

void RecordMessageScreen::endEntry()
{
    if (mEndRecordingIndicator)     { delete mEndRecordingIndicator; mEndRecordingIndicator = NULL; }
    if (mBeginRecordingIndicator)   { delete mBeginRecordingIndicator; mBeginRecordingIndicator = NULL; }
    if (mNewMessage)                { delete mNewMessage; mNewMessage = NULL; }
    if (mRecordTimer)               { delete mRecordTimer; mRecordTimer = NULL; }
    if (mSliderUpdateTimer)         { delete mSliderUpdateTimer; mSliderUpdateTimer = NULL; }
    if (mSound)                     { delete mSound; mSound = NULL; }
}

void RecordMessageScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Idling

void RecordMessageScreen::idleDoneEntry() { if (mBeginRecordingIndicator) mBeginRecordingIndicator->play(); }
void RecordMessageScreen::idleWaitForHeyGocastEntry() { if (mBeginRecordingIndicator) mBeginRecordingIndicator->play(); }
void RecordMessageScreen::idleWaitForOkayImFinishedEntry() { if (mBeginRecordingIndicator) mBeginRecordingIndicator->play(); }
void RecordMessageScreen::idleWaitForReadFiveEntry() { if (mBeginRecordingIndicator) mBeginRecordingIndicator->play(); }
void RecordMessageScreen::idleWaitForReadMeTheSecondEmailEntry() { if (mBeginRecordingIndicator) mBeginRecordingIndicator->play(); }
void RecordMessageScreen::idleWaitForReadMyNewMessagesEntry() { if (mBeginRecordingIndicator) mBeginRecordingIndicator->play(); }
void RecordMessageScreen::idleWaitForYesLetsReplyEntry() { if (mBeginRecordingIndicator) mBeginRecordingIndicator->play(); }
void RecordMessageScreen::idleWaitForYesLetsReviewEntry() { if (mBeginRecordingIndicator) mBeginRecordingIndicator->play(); }
void RecordMessageScreen::idleWaitForYesReadItBackEntry() { if (mBeginRecordingIndicator) mBeginRecordingIndicator->play(); }
void RecordMessageScreen::idleWaitForYesSendThisEmailEntry() { if (mBeginRecordingIndicator) mBeginRecordingIndicator->play(); }

#pragma mark Queries

#pragma mark Actions
void RecordMessageScreen::playSendingSoundEntry()
{
    if (mNewMessage)
    {
        mNewMessage->play();
    }
}
#pragma mark UI

void RecordMessageScreen::speakDemoEmailEntry()
{
    [gAppDelegateInstance startSpeaking:
     "TJ, Sandra, Another meeting will start at 5PM, let's cancel today's meeting."
     "I'll be back on July 29th (Tuesday), but will check e-mail occasionally."
     "Hee day. Would you like to reply to this email?"];
}

void RecordMessageScreen::speakFiveSubjectLinesEntry()
{
    [gAppDelegateInstance startSpeaking:
     "From: Yoji, Kyoko, and Sandra. Subject: Meeting on Skype."
     "From: Sandra and Hideyuki. Subject: Cancel today's meeting?"
     "From: Sandra Carrico. Subject: Re: Skype today."
     "From: Hideyuki Mizusawa. Subject: New build of GoCast Talk and GoCast Talk En."
     "From: Sandra Carrico. Subject: I'll call in via GoCast Study."
     ];
}

void RecordMessageScreen::speakFourSubjectLinesEntry()
{
    [gAppDelegateInstance startSpeaking:
     "From: Yoji, Kyoko, and Sandra. Subject: Meeting on Skype."
     "From: Sandra Carrico. Subject: Re: Skype today."
     "From: Hideyuki Mizusawa. Subject: New build of GoCast Talk and GoCast Talk En."
     "From: Sandra Carrico. Subject: I'll call in via GoCast Study."
     ];
}

void RecordMessageScreen::speakHeyHowCanIHelpYouEntry()
{
    [gAppDelegateInstance startSpeaking:"Hey TJ, how can I help you?"];
}

void RecordMessageScreen::speakPleaseReplyToEmailEntry()
{
    [gAppDelegateInstance startSpeaking:"Okay, replying to the message. Begin speaking after the tone."];
}

void RecordMessageScreen::speakReadBackEmailEntry()
{
    [gAppDelegateInstance startSpeaking:"Okay, sounds good. I'll talk to you later. Would you like to send this email?"];
}

void RecordMessageScreen::speakReviewOtherFourEntry()
{
    [gAppDelegateInstance startSpeaking:"Mail sent. Would you like to review the other four messages?"];
}

void RecordMessageScreen::speakWouldYouLikeReadBackEntry()
{
    [gAppDelegateInstance startSpeaking:"Would you like your reply red back to you?"];
}

void RecordMessageScreen::speakYouHave20NewMessagesEntry()
{
    [gAppDelegateInstance startSpeaking:"You have twenty new messages"];
}

#pragma mark Sending messages to other machines

#pragma mark State wiring

void RecordMessageScreen::CallEntry()
{
	switch(mState)
	{
		case kEnd: EndEntryHelper(); break;
		case kIdleDone: idleDoneEntry(); break;
		case kIdleWaitForHeyGocast: idleWaitForHeyGocastEntry(); break;
		case kIdleWaitForOkayImFinished: idleWaitForOkayImFinishedEntry(); break;
		case kIdleWaitForReadFive: idleWaitForReadFiveEntry(); break;
		case kIdleWaitForReadMeTheSecondEmail: idleWaitForReadMeTheSecondEmailEntry(); break;
		case kIdleWaitForReadMyNewMessages: idleWaitForReadMyNewMessagesEntry(); break;
		case kIdleWaitForYesLetsReply: idleWaitForYesLetsReplyEntry(); break;
		case kIdleWaitForYesLetsReview: idleWaitForYesLetsReviewEntry(); break;
		case kIdleWaitForYesReadItBack: idleWaitForYesReadItBackEntry(); break;
		case kIdleWaitForYesSendThisEmail: idleWaitForYesSendThisEmailEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kPlaySendingSound: playSendingSoundEntry(); break;
		case kSpeakDemoEmail: speakDemoEmailEntry(); break;
		case kSpeakFiveSubjectLines: speakFiveSubjectLinesEntry(); break;
		case kSpeakFourSubjectLines: speakFourSubjectLinesEntry(); break;
		case kSpeakHeyHowCanIHelpYou: speakHeyHowCanIHelpYouEntry(); break;
		case kSpeakPleaseReplyToEmail: speakPleaseReplyToEmailEntry(); break;
		case kSpeakReadBackEmail: speakReadBackEmailEntry(); break;
		case kSpeakReviewOtherFour: speakReviewOtherFourEntry(); break;
		case kSpeakWouldYouLikeReadBack: speakWouldYouLikeReadBackEntry(); break;
		case kSpeakYouHave20NewMessages: speakYouHave20NewMessagesEntry(); break;
		case kStart: startEntry(); break;
		default: break;
	}
}

void RecordMessageScreen::CallExit()
{
}

int  RecordMessageScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kIdleWaitForHeyGocast) && (evt == kHeardHey)) return kSpeakHeyHowCanIHelpYou; else
	if ((mState == kIdleWaitForOkayImFinished) && (evt == kHeardOkay)) return kSpeakWouldYouLikeReadBack; else
	if ((mState == kIdleWaitForReadFive) && (evt == kHeardFive)) return kSpeakFiveSubjectLines; else
	if ((mState == kIdleWaitForReadMeTheSecondEmail) && (evt == kHeardReadMeSecond)) return kSpeakDemoEmail; else
	if ((mState == kIdleWaitForReadMyNewMessages) && (evt == kHeardReadNew)) return kSpeakYouHave20NewMessages; else
	if ((mState == kIdleWaitForYesLetsReply) && (evt == kHeardYes)) return kSpeakPleaseReplyToEmail; else
	if ((mState == kIdleWaitForYesLetsReview) && (evt == kHeardYes)) return kSpeakFourSubjectLines; else
	if ((mState == kIdleWaitForYesReadItBack) && (evt == kHeardYes)) return kSpeakReadBackEmail; else
	if ((mState == kIdleWaitForYesSendThisEmail) && (evt == kHeardYes)) return kPlaySendingSound; else
	if ((mState == kPlaySendingSound) && (evt == kIndicatorFinished)) return kSpeakReviewOtherFour; else
	if ((mState == kSpeakDemoEmail) && (evt == kSpeakingDone)) return kIdleWaitForYesLetsReply; else
	if ((mState == kSpeakFiveSubjectLines) && (evt == kSpeakingDone)) return kIdleWaitForReadMeTheSecondEmail; else
	if ((mState == kSpeakFourSubjectLines) && (evt == kSpeakingDone)) return kIdleDone; else
	if ((mState == kSpeakHeyHowCanIHelpYou) && (evt == kSpeakingDone)) return kIdleWaitForReadMyNewMessages; else
	if ((mState == kSpeakPleaseReplyToEmail) && (evt == kSpeakingDone)) return kIdleWaitForOkayImFinished; else
	if ((mState == kSpeakReadBackEmail) && (evt == kSpeakingDone)) return kIdleWaitForYesSendThisEmail; else
	if ((mState == kSpeakReviewOtherFour) && (evt == kSpeakingDone)) return kIdleWaitForYesLetsReview; else
	if ((mState == kSpeakWouldYouLikeReadBack) && (evt == kSpeakingDone)) return kIdleWaitForYesReadItBack; else
	if ((mState == kSpeakYouHave20NewMessages) && (evt == kSpeakingDone)) return kIdleWaitForReadFive; else
	if ((mState == kStart) && (evt == kNext)) return kIdleWaitForHeyGocast;

	return kInvalidState;
}

bool RecordMessageScreen::HasEdgeNamedNext() const
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
void RecordMessageScreen::update(const RecordMessageScreenMessage& msg)
{
	process(msg.mEvent);
}

void RecordMessageScreen::update(const tSoundEvent& msg)
{
    switch (msg.mEvent)
    {
        case tSoundEvent::kSoundPlayingComplete:
            if (msg.mSource == mNewMessage)
            {
                if (getState() == kPlaySendingSound)
                {
                    update(kIndicatorFinished);
                }
            }
            break;

        default:
            break;
    }
}

void RecordMessageScreen::update(const URLLoaderEvent& msg)
{
#pragma unused(msg)
//    if (msg.mId == this)
//    {
//        [mPeer setBlockingViewVisible:false];
//
//        switch (msg.mEvent)
//        {
//            case URLLoaderEvent::kLoadFail: update(kFail); break;
//            case URLLoaderEvent::kLoadedString:
//                switch (getState())
//                {
//                    case kSendPostAudioToServer:
//                        mPostAudioJSON = JSONUtil::extract(msg.mString);
//                        break;
//
//                    default:
//                        break;
//                }
//                update(kSuccess);
//                break;
//
//            case URLLoaderEvent::kLoadedFile: update(kSuccess); break;
//
//            default:
//                break;
//        }
//    }
}

void RecordMessageScreen::update(const GCTEvent& msg)
{
    switch(msg.mEvent)
    {
        case GCTEvent::kInboxTabPressed:
        case GCTEvent::kNewMemoTabPressed:
        case GCTEvent::kContactsTabPressed:
        case GCTEvent::kSettingsTabPressed:
            switch (getState())
            {
//                case kPlayingIdle:   update(kPausePressed); break;
//                case kIdleListening: update(kStopPressed); break;

                default:
                    break;
            }
            break;

        case GCTEvent::kSaidHeyGoCast:
            if (getState() == kIdleWaitForHeyGocast)
            {
                update(kHeardHey);
            }
            break;

        case GCTEvent::kSaidReadMyNewMessages:
            if (getState() == kIdleWaitForReadMyNewMessages)
            {
                update(kHeardReadNew);
            }
            break;

        case GCTEvent::kSaidReadFive:
            if (getState() == kIdleWaitForReadFive)
            {
                update(kHeardFive);
            }
            break;
        case GCTEvent::kSaidReadMeTheSecondEmail:
            if (getState() == kIdleWaitForReadMeTheSecondEmail)
            {
                update(kHeardReadMeSecond);
            }
            break;
        case GCTEvent::kSaidYes:
            switch (getState())
            {
                case kIdleWaitForYesLetsReply:
                case kIdleWaitForYesLetsReview:
                case kIdleWaitForYesReadItBack:
                case kIdleWaitForYesSendThisEmail:
                    update(kHeardYes);
                    break;
                    
                default:
                    break;
            }
            break;
        case GCTEvent::kSaidOkayFinished:
            if (getState() == kIdleWaitForOkayImFinished)
            {
                update(kHeardOkay);
            }
            break;

        case GCTEvent::kSpeakingFinished:
            switch (getState())
            {
                case kSpeakDemoEmail:
                case kSpeakFiveSubjectLines:
                case kSpeakFourSubjectLines:
                case kSpeakHeyHowCanIHelpYou:
                case kSpeakPleaseReplyToEmail:
                case kSpeakReadBackEmail:
                case kSpeakReviewOtherFour:
                case kSpeakWouldYouLikeReadBack:
                case kSpeakYouHave20NewMessages:
                    update(kSpeakingDone);
                    break;

                default:
                    break;
            }
            break;

        case GCTEvent::kTranscriptFinished:
//            mGotTranscriptionEvent = true;
//
//            if (mRecordingCommand)
//            {
//                mTranscription = msg.mTranscription;
//
//                [mPeer setTranscription:msg.mTranscription];
//            }
//            else
//            {
//                mMessage = msg.mTranscription;
//
//                [mPeer setMessage:msg.mTranscription];
//            }
//
//            if ((getState() == kIdleWaitForListeningTranscription) ||
//                (getState() == kIdleListening) ||
//                (getState() == kIdleWaitForRecordingTranscription) ||
//                (getState() == kIdleRecording))
//            {
//                update(kTranscriptionReady);
//            }
            break;

        default:
            switch (getState())
            {
//                case kShowComposeMessage:
//                    switch(msg.mEvent)
//                    {
//                        case GCTEvent::kOKYesAlertPressed:  update(kYes); break;
//                        case GCTEvent::kNoAlertPressed:     update(kNo); break;
//
//                        default:
//                            break;
//                    }
//                    break;
//
                default:
                    break;
            }
            break;
    }
}

void RecordMessageScreen::update(const tTimerEvent& msg)
{
    switch (msg.mEvent)
    {
        default:
            break;
    }
}

