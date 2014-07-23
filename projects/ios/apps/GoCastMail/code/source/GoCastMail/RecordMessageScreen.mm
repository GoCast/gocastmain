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
size_t RecordMessageScreen::getToCount()
{
    return mInitObject["to"].mArray.size();
}

std::string RecordMessageScreen::getTo(const size_t& i)
{
//    return mInitObject["from"].mString;
    return mInitObject["to"].mArray[i].mString;
}

void RecordMessageScreen::deleteTo(const size_t& i)
{
    mInitObject["to"].mArray.erase(mInitObject["to"].mArray.begin() + (const int)i);
}

void RecordMessageScreen::donePressed()
{
//    update(kSendPressed);
}

void RecordMessageScreen::cancelPressed()
{
//    update(kCancelPressed);
}

void RecordMessageScreen::pausePressed()
{
//    if (getState() == kPlayingIdle)
//    {
//        update(kPausePressed);
//    }
}

void RecordMessageScreen::recordPressed()
{
//    if (getState() == kWaitToRecordIdle)
//    {
//        update(kRecordPressed);
//    }
}

void RecordMessageScreen::playPressed()
{
//    if (getState() == kWaitToPlayIdle || getState() == kPausedIdle)
//    {
//        update(kPlayPressed);
//    }
}

void RecordMessageScreen::stopPressed()
{
//    if (getState() == kRecordingIdle)
//    {
//        update(kStopPressed);
//    }
}

#pragma mark Start / End / Invalid
void RecordMessageScreen::startEntry()
{
    mForceLogout    = false;

    mSound          = NULL;
    mBeginRecordingIndicator    = NULL;
    mEndRecordingIndicator      = NULL;
    mTenMinuteTimer = NULL;
    mDidRecord      = false;

    GCTEventManager::getInstance()->attach(this);
    URLLoader::getInstance()->attach(this);

    mSliderUpdateTimer = new tTimer(30);
    mSliderUpdateTimer->attach(this);

    mRecordTimer = new tTimer(1000);
    mRecordTimer->attach(this);

    mBeginRecordingIndicator    = new tSound(tFile(tFile::kBundleDirectory, "begin_record.caf"));
    mEndRecordingIndicator      = new tSound(tFile(tFile::kBundleDirectory, "end_record.caf"));

    mBeginRecordingIndicator->attach(this);
}

void RecordMessageScreen::endEntry()
{
    if (mEndRecordingIndicator)     { delete mEndRecordingIndicator; mEndRecordingIndicator = NULL; }
    if (mBeginRecordingIndicator)   { delete mBeginRecordingIndicator; mBeginRecordingIndicator = NULL; }
    if (mRecordTimer)               { delete mRecordTimer; mRecordTimer = NULL; }
    if (mSliderUpdateTimer)         { delete mSliderUpdateTimer; mSliderUpdateTimer = NULL; }
    if (mTenMinuteTimer)            { delete mTenMinuteTimer; mTenMinuteTimer = NULL; }
    if (mSound)                     { delete mSound; mSound = NULL; }
}

void RecordMessageScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Idling
void RecordMessageScreen::idleEntry()
{
}

#pragma mark Queries

#pragma mark Actions

#pragma mark Sending to server

#pragma mark UI

#pragma mark Sending messages to other machines

#pragma mark State wiring

void RecordMessageScreen::CallEntry()
{
	switch(mState)
	{
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kStart: startEntry(); break;
		default: break;
	}
}

void RecordMessageScreen::CallExit()
{
}

int  RecordMessageScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kStart) && (evt == kNext)) return kIdle;

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
//            update(kFinishedPlaying);
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
    if (msg.mEvent == GCTEvent::kLanguageChanged)
    {
        [mPeer refreshLanguage];
    }

    switch(msg.mEvent)
    {
        case GCTEvent::kForceLogin:
            mForceLogout = false;
            break;

        case GCTEvent::kForceLogout:
            mForceLogout = true;
            break;

        case GCTEvent::kInboxTabPressed:
        case GCTEvent::kNewMemoTabPressed:
        case GCTEvent::kContactsTabPressed:
        case GCTEvent::kSettingsTabPressed:
            switch (getState())
            {
//                case kPlayingIdle:   update(kPausePressed); break;
//                case kRecordingIdle: update(kStopPressed); break;

                default:
                    break;
            }
            break;

        case GCTEvent::kTranscriptFinished:
//            {
//                mGotTranscriptionEvent = true;
//
//                [mPeer setTranscription:msg.mTranscription];
//                [mPeer setTranscriptionEnabled:true];
//
//                mTranscription["ja"] = msg.mTranscription;
//                tFile(tFile::kTemporaryDirectory, "transcript.json").write(JSONValue(mTranscription).toString().c_str());
//
//                if (getState() == kWaitForTranscriptionIdle)
//                {
//                    update(kTranscriptionReady);
//                }
//            }
            break;

        default:
            switch (getState())
            {
//                case kShowComposeNewMessage:
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
        case tTimer::kTimerTick:
            if (msg.mTimer == mRecordTimer)
            {
                mRecrodSeconds++;
                char buf[80];
                sprintf(buf, "%02lu:%02lu", mRecrodSeconds / 60, mRecrodSeconds % 60);
                [mPeer setTimeLabel:buf];
            }
            else
            {
//                if (getState() == kPlayingIdle)
//                {
//                    if (mSound)
//                    {
//                        [mPeer setSliderPercentage: float(tTimer::getTimeMS() - mStartTimeMS) / float(mSound->getDurationMS()) * 100.0f];
//                    }
//                }
            }
            break;
        case tTimer::kTimerCompleted:
            if (msg.mTimer == mTenMinuteTimer)
            {
                if (mTenMinuteTimer) { delete mTenMinuteTimer; mTenMinuteTimer = NULL; }

//                if (getState() == kRecordingIdle)
//                {
//                    update(kStopPressed);
//                    tAlert("Record limit is 10 minutes. Recording will now stop");
//                }
            }
            break;

        default:
            break;
    }
}

