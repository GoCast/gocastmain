#include "Base/package.h"
#include "Io/package.h"
#include "Audio/package.h"

#include "package.h"

#include "EditAllGroupsVC.h"

#pragma mark Constructor / Destructor
EditAllGroupsScreen::EditAllGroupsScreen(EditAllGroupsVC* newVC)
: mPeer(newVC)
{
	ConstructMachine();
}

EditAllGroupsScreen::~EditAllGroupsScreen()
{
	DestructMachine();
}

#pragma mark Public methods
void EditAllGroupsScreen::pressCreate()
{
    process(kCreatePressed);
}

void EditAllGroupsScreen::groupPressed(const size_t& i)
{
    if (getState() == kIdle)
    {
        mItemSelected = i;
        process(kGroupSelected);
    }
}

void EditAllGroupsScreen::deleteGroupPressed(const size_t& i)
{
    if (getState() == kIdle)
    {
        mDeleteSelected = i;
        process(kDeleteGroup);
    }
}

void EditAllGroupsScreen::refreshPressed()
{
    if (getState() == kIdle)
    {
        process(kRefreshSelected);
    }
}

#pragma mark Start / End / Invalid
void EditAllGroupsScreen::startEntry()
{
    GCTEventManager::getInstance()->attach(this);
    URLLoader::getInstance()->attach(this);
}

void EditAllGroupsScreen::endEntry()
{
}

void EditAllGroupsScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Idling
void EditAllGroupsScreen::idleEntry()
{
}

#pragma mark Peer communication
void EditAllGroupsScreen::peerReloadTableEntry()
{
    [mPeer reloadTable];
}

void EditAllGroupsScreen::peerPushEditOneGroupForExistingEntry()
{
    [mPeer pushEditOneGroup:InboxScreen::mGroups[mItemSelected].mObject];
}

void EditAllGroupsScreen::peerPushEditOneGroupForNewEntry()
{
    [mPeer pushEditOneGroup:JSONObject()];
}

#pragma mark Queries
void EditAllGroupsScreen::wasSetGroupsSuccessfulEntry()
{
    bool result = false;

    if (mSetGroupsJSON["status"].mString == std::string("success"))
    {
        result = true;
    }

    SetImmediateEvent(result ? kYes : kNo);
}


#pragma mark Actions
void EditAllGroupsScreen::deleteLocalGroupEntry()
{
    InboxScreen::mGroups.erase(InboxScreen::mGroups.begin() + (int)mDeleteSelected);
}

void EditAllGroupsScreen::sendSetGroupsToServerEntry()
{
    [mPeer setBlockingViewVisible:true];

    std::vector<std::pair<std::string, std::string> > params;

    params.push_back(std::pair<std::string, std::string>("action", "setGroups"));
    params.push_back(std::pair<std::string, std::string>("name", InboxScreen::mEmailAddress));
    params.push_back(std::pair<std::string, std::string>("authToken", InboxScreen::mToken));

    params.push_back(std::pair<std::string, std::string>("MAX_FILE_SIZE", "10485760"));

    tFile(tFile::kTemporaryDirectory, "groups.json").write(JSONValue(InboxScreen::mGroups).toString());

    URLLoader::getInstance()->postFile(this, kMemoAppServerURL, params, tFile(tFile::kTemporaryDirectory, "groups.json"));
}

#pragma mark UI
void EditAllGroupsScreen::setWaitForSetGroupsEntry()
{
    [mPeer setBlockingViewVisible:true];
}

void EditAllGroupsScreen::showErrorWithSetGroupsEntry()
{
    tAlert("Error saving group details");
}

#pragma mark Sending messages to other machines
void EditAllGroupsScreen::sendReloadInboxToVCEntry()
{
    GCTEventManager::getInstance()->notify(GCTEvent(GCTEvent::kReloadInbox));
}

#pragma mark State wiring
void EditAllGroupsScreen::CallEntry()
{
	switch(mState)
	{
		case kDeleteLocalGroup: deleteLocalGroupEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kPeerPushEditOneGroupForExisting: peerPushEditOneGroupForExistingEntry(); break;
		case kPeerPushEditOneGroupForNew: peerPushEditOneGroupForNewEntry(); break;
		case kPeerReloadTable: peerReloadTableEntry(); break;
		case kSendReloadInboxToVC: sendReloadInboxToVCEntry(); break;
		case kSendSetGroupsToServer: sendSetGroupsToServerEntry(); break;
		case kSetWaitForSetGroups: setWaitForSetGroupsEntry(); break;
		case kShowErrorWithSetGroups: showErrorWithSetGroupsEntry(); break;
		case kStart: startEntry(); break;
		case kWasSetGroupsSuccessful: wasSetGroupsSuccessfulEntry(); break;
		default: break;
	}
}

void EditAllGroupsScreen::CallExit()
{
}

int  EditAllGroupsScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kDeleteLocalGroup) && (evt == kNext)) return kSetWaitForSetGroups; else
	if ((mState == kIdle) && (evt == kCreatePressed)) return kPeerPushEditOneGroupForNew; else
	if ((mState == kIdle) && (evt == kDeleteGroup)) return kDeleteLocalGroup; else
	if ((mState == kIdle) && (evt == kFail)) return kIdle; else
	if ((mState == kIdle) && (evt == kGroupSelected)) return kPeerPushEditOneGroupForExisting; else
	if ((mState == kIdle) && (evt == kRefreshSelected)) return kPeerReloadTable; else
	if ((mState == kIdle) && (evt == kSuccess)) return kIdle; else
	if ((mState == kPeerPushEditOneGroupForExisting) && (evt == kNext)) return kIdle; else
	if ((mState == kPeerPushEditOneGroupForNew) && (evt == kNext)) return kIdle; else
	if ((mState == kPeerReloadTable) && (evt == kNext)) return kIdle; else
	if ((mState == kSendReloadInboxToVC) && (evt == kNext)) return kPeerReloadTable; else
	if ((mState == kSendSetGroupsToServer) && (evt == kFail)) return kShowErrorWithSetGroups; else
	if ((mState == kSendSetGroupsToServer) && (evt == kSuccess)) return kWasSetGroupsSuccessful; else
	if ((mState == kSetWaitForSetGroups) && (evt == kNext)) return kSendSetGroupsToServer; else
	if ((mState == kShowErrorWithSetGroups) && (evt == kYes)) return kIdle; else
	if ((mState == kStart) && (evt == kNext)) return kIdle; else
	if ((mState == kWasSetGroupsSuccessful) && (evt == kNo)) return kShowErrorWithSetGroups; else
	if ((mState == kWasSetGroupsSuccessful) && (evt == kYes)) return kSendReloadInboxToVC;

	return kInvalidState;
}

bool EditAllGroupsScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kEnd:
		case kIdle:
		case kInvalidState:
		case kSendSetGroupsToServer:
		case kShowErrorWithSetGroups:
		case kWasSetGroupsSuccessful:
			return false;
		default: break;
	}
	return true;
}

#pragma mark Messages
void EditAllGroupsScreen::update(const EditAllGroupsScreenMessage& msg)
{
	process(msg.mEvent);
}

void EditAllGroupsScreen::update(const URLLoaderEvent& msg)
{
    if (msg.mId == this)
    {
        [mPeer setBlockingViewVisible:false];

        switch (msg.mEvent)
        {
            case URLLoaderEvent::kLoadFail: process(kFail); break;
            case URLLoaderEvent::kLoadedString:
            {
                switch (getState())
                {
                    case kSendSetGroupsToServer:
                        mSetGroupsJSON = JSONUtil::extract(msg.mString);
                        break;

                    default:
                        break;
                }
            }
                process(kSuccess);
                break;

            case URLLoaderEvent::kLoadedFile: process(kSuccess); break;

            default:
                break;
        }
    }
}

void EditAllGroupsScreen::update(const GCTEvent& msg)
{
    switch (getState())
    {
        case kIdle:
            switch (msg.mEvent)
            {
                case GCTEvent::kReloadInbox:        refreshPressed(); break;

                default:
                    break;
            }
            break;

        case kShowErrorWithSetGroups:
            switch(msg.mEvent)
            {
                case GCTEvent::kOKYesAlertPressed:  process(kYes); break;
                case GCTEvent::kNoAlertPressed:     process(kNo); break;

                default:
                    break;
            }
            break;
            
        default:
            break;
    }
}

