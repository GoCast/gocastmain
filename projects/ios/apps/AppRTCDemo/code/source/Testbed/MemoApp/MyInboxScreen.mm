#include "Base/package.h"
#include "Io/package.h"

#include "package.h"

#pragma mark Constructor / Destructor
MyInboxScreen::MyInboxScreen()
{
	ConstructMachine();
}

MyInboxScreen::~MyInboxScreen()
{
	DestructMachine();
}

#pragma mark Start / End / Invalid
void MyInboxScreen::startEntry()
{
    MemoEventManager::getInstance()->attach(this);
    URLLoader::getInstance()->attach(this);

    [gAppDelegateInstance setMyInboxScreenVisible:true];
}

void MyInboxScreen::endEntry()
{
    [gAppDelegateInstance setMyInboxScreenVisible:false];
}

void MyInboxScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Idling
void MyInboxScreen::idleEntry()
{
}

void MyInboxScreen::serverErrorIdleEntry()
{
}

#pragma mark Queries
void MyInboxScreen::isInboxValidEntry()
{
    bool result = false;

    if (JSONUtil::extract(mListInboxJSON)["status"] == std::string("success"))
    {
        result = true;
    }

    SetImmediateEvent(result ? kYes : kNo);
}

void MyInboxScreen::wasDeleteSuccessfulEntry()
{
    bool result = false;

    if (JSONUtil::extract(mDeleteFileJSON)["status"] == std::string("success"))
    {
        result = true;
    }

    SetImmediateEvent(result ? kYes : kNo);
}

#pragma mark Actions
void MyInboxScreen::copyDownloadToDestinationEntry()
{
    tFile(tFile::kTemporaryDirectory, mInboxList[mItemSelected].c_str()).rename(tFile::kDocumentsDirectory, mInboxList[mItemSelected].c_str());
}

void MyInboxScreen::sendListInboxToServerEntry()
{
    char buf[512];

    sprintf(buf, "%s?action=listInbox&name=%s",
            kMemoAppServerURL,
            std::string(tFile(tFile::kPreferencesDirectory, "logintoken.txt")).c_str());

    URLLoader::getInstance()->loadString(buf);
}

void MyInboxScreen::sendDownloadRequestToServerEntry()
{
    char buf[512];

    sprintf(buf, "%sdatabase/inbox/%s/%s",
            kMemoAppServerURL,
            std::string(tFile(tFile::kPreferencesDirectory, "logintoken.txt")).c_str(),
            mInboxList[mItemSelected].c_str());

    URLLoader::getInstance()->loadFile(buf, tFile(tFile::kTemporaryDirectory, mInboxList[mItemSelected].c_str()));
}

void MyInboxScreen::sendDeleteRequestToServerEntry()
{
    char buf[512];

    sprintf(buf, "%s?action=deleteFile&name=%s&file=%s",
            kMemoAppServerURL,
            std::string(tFile(tFile::kPreferencesDirectory, "logintoken.txt")).c_str(),
            mInboxList[mItemSelected].c_str());

    URLLoader::getInstance()->loadString(buf);
}


#pragma mark User Interface
void MyInboxScreen::updateInboxTableEntry()
{
    mInboxList = JSONUtil::explodeCommas(JSONUtil::extract(mListInboxJSON)["list"]);

    std::vector<std::string> inboxMod;
    for(size_t i = 0; i < mInboxList.size(); i++)
    {
        if (mInboxList[i] != "." && mInboxList[i] != "..")
        {
            inboxMod.push_back(mInboxList[i]);
        }
    }

    mInboxList = inboxMod;

    [gAppDelegateInstance setMyInboxTable:mInboxList];
}

void MyInboxScreen::setNormalStatusEntry()
{
    //TODO: Implement
}

void MyInboxScreen::setDownloadingStatusEntry()
{
    //TODO: Implement
}

void MyInboxScreen::showDeleteFailedEntry()
{
    tAlert("Could not delete file from server inbox");
}

void MyInboxScreen::showDownloadMessageEntry()
{
    tConfirm("Do you want to download this memo?");
}

void MyInboxScreen::showErrorLoadingInboxEntry()
{
    tAlert("There was an error loading the inbox");
}

void MyInboxScreen::showFileWillBeDeletedEntry()
{
    tAlert("This file will be deleted off of the server");
}

void MyInboxScreen::showRetryDeleteEntry()
{
    tConfirm("Couldn't contact server, retry delete from inbox?");
}

void MyInboxScreen::showRetryDownloadEntry()
{
    tConfirm("Couldn't contact server, retry download?");
}

void MyInboxScreen::showRetryListInboxEntry()
{
    tConfirm("Couldn't contact server, retry refresh inbox?");
}

void MyInboxScreen::showServerErrorEntry()
{
    tAlert("There was an unrecoverable server error. Please restart application.");
}

#pragma mark Messages to other machines
void MyInboxScreen::sendGoRecordingsToVCEntry()
{
    this->tSubject<const MemoAppMessage&>::notify(MemoAppMessage(MemoApp::kGoRecordings));
}

#pragma mark State wiring
void MyInboxScreen::CallEntry()
{
	switch(mState)
	{
		case kCopyDownloadToDestination: copyDownloadToDestinationEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kIsInboxValid: isInboxValidEntry(); break;
		case kSendDeleteRequestToServer: sendDeleteRequestToServerEntry(); break;
		case kSendDownloadRequestToServer: sendDownloadRequestToServerEntry(); break;
		case kSendGoRecordingsToVC: sendGoRecordingsToVCEntry(); break;
		case kSendListInboxToServer: sendListInboxToServerEntry(); break;
		case kServerErrorIdle: serverErrorIdleEntry(); break;
		case kSetDownloadingStatus: setDownloadingStatusEntry(); break;
		case kSetNormalStatus: setNormalStatusEntry(); break;
		case kShowDeleteFailed: showDeleteFailedEntry(); break;
		case kShowDownloadMessage: showDownloadMessageEntry(); break;
		case kShowErrorLoadingInbox: showErrorLoadingInboxEntry(); break;
		case kShowFileWillBeDeleted: showFileWillBeDeletedEntry(); break;
		case kShowRetryDelete: showRetryDeleteEntry(); break;
		case kShowRetryDownload: showRetryDownloadEntry(); break;
		case kShowRetryListInbox: showRetryListInboxEntry(); break;
		case kShowServerError: showServerErrorEntry(); break;
		case kStart: startEntry(); break;
		case kUpdateInboxTable: updateInboxTableEntry(); break;
		case kWasDeleteSuccessful: wasDeleteSuccessfulEntry(); break;
		default: break;
	}
}

void MyInboxScreen::CallExit()
{
}

int  MyInboxScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kCopyDownloadToDestination) && (evt == kNext)) return kShowFileWillBeDeleted; else
	if ((mState == kIdle) && (evt == kItemSelected)) return kShowDownloadMessage; else
	if ((mState == kIsInboxValid) && (evt == kNo)) return kShowErrorLoadingInbox; else
	if ((mState == kIsInboxValid) && (evt == kYes)) return kUpdateInboxTable; else
	if ((mState == kSendDeleteRequestToServer) && (evt == kFail)) return kShowRetryDelete; else
	if ((mState == kSendDeleteRequestToServer) && (evt == kSuccess)) return kWasDeleteSuccessful; else
	if ((mState == kSendDownloadRequestToServer) && (evt == kFail)) return kShowRetryDownload; else
	if ((mState == kSendDownloadRequestToServer) && (evt == kSuccess)) return kCopyDownloadToDestination; else
	if ((mState == kSendListInboxToServer) && (evt == kFail)) return kShowRetryListInbox; else
	if ((mState == kSendListInboxToServer) && (evt == kSuccess)) return kIsInboxValid; else
	if ((mState == kServerErrorIdle) && (evt == kItemSelected)) return kShowServerError; else
	if ((mState == kSetDownloadingStatus) && (evt == kNext)) return kSendDownloadRequestToServer; else
	if ((mState == kSetNormalStatus) && (evt == kNext)) return kIdle; else
	if ((mState == kShowDeleteFailed) && (evt == kYes)) return kSendGoRecordingsToVC; else
	if ((mState == kShowDownloadMessage) && (evt == kNo)) return kSetNormalStatus; else
	if ((mState == kShowDownloadMessage) && (evt == kYes)) return kSetDownloadingStatus; else
	if ((mState == kShowErrorLoadingInbox) && (evt == kYes)) return kShowServerError; else
	if ((mState == kShowFileWillBeDeleted) && (evt == kYes)) return kSendDeleteRequestToServer; else
	if ((mState == kShowRetryDelete) && (evt == kNo)) return kShowServerError; else
	if ((mState == kShowRetryDelete) && (evt == kYes)) return kSendDeleteRequestToServer; else
	if ((mState == kShowRetryDownload) && (evt == kNo)) return kShowServerError; else
	if ((mState == kShowRetryDownload) && (evt == kYes)) return kSendDownloadRequestToServer; else
	if ((mState == kShowRetryListInbox) && (evt == kNo)) return kShowServerError; else
	if ((mState == kShowRetryListInbox) && (evt == kYes)) return kSendListInboxToServer; else
	if ((mState == kShowServerError) && (evt == kYes)) return kServerErrorIdle; else
	if ((mState == kStart) && (evt == kNext)) return kSendListInboxToServer; else
	if ((mState == kUpdateInboxTable) && (evt == kNext)) return kSetNormalStatus; else
	if ((mState == kWasDeleteSuccessful) && (evt == kNo)) return kShowDeleteFailed; else
	if ((mState == kWasDeleteSuccessful) && (evt == kYes)) return kSendGoRecordingsToVC;

	return kInvalidState;
}

bool MyInboxScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kCopyDownloadToDestination:
		case kSetDownloadingStatus:
		case kSetNormalStatus:
		case kStart:
		case kUpdateInboxTable:
			return true;
		default: break;
	}
	return false;
}

#pragma mark Messages
void MyInboxScreen::update(const MyInboxScreenMessage& msg)
{
	process(msg.mEvent);
}

void MyInboxScreen::update(const MemoEvent& msg)
{
    switch (msg.mEvent)
    {
        case MemoEvent::kTableItemSelected:
            mItemSelected = msg.mItemSelected;
            process(kItemSelected);
            break;

        case MemoEvent::kOKYesAlertPressed: process(kYes); break;
        case MemoEvent::kNoAlertPressed: process(kNo); break;


        default:
            break;
    }
}

void MyInboxScreen::update(const URLLoaderEvent& msg)
{
    printf("MyInboxScreen[%d]:: %s\n", getState(), msg.mString.c_str());
    switch (msg.mEvent)
    {
        case URLLoaderEvent::kLoadFail: process(kFail); break;
        case URLLoaderEvent::kLoadedString:
        {
            switch (getState())
            {
                case kSendListInboxToServer:
                    mListInboxJSON = msg.mString;
                    process(kSuccess);
                    break;

                case kSendDeleteRequestToServer:
                    mDeleteFileJSON = msg.mString;
                    process(kSuccess);
                    break;

                default:
                    break;
            }
        }
            break;

        case URLLoaderEvent::kLoadedFile: process(kSuccess); break;

        default:
            break;
    }
}

