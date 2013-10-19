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
void MyInboxScreen::doesSelectedItemExistLocallyEntry()
{
    bool result = std::find(mLocalFileList.begin(), mLocalFileList.end(), mMergedFileList[mItemSelected]) != mLocalFileList.end();

    SetImmediateEvent(result ? kYes : kNo);
}

void MyInboxScreen::wasListInboxValidEntry()
{
    bool result = false;

    if (JSONUtil::extract(mListInboxJSON)["status"] == std::string("success"))
    {
        result = true;
    }

    SetImmediateEvent(result ? kYes : kNo);
}

#pragma mark Actions
void MyInboxScreen::makeListOfLocalFilesEntry()
{
    mLocalFileList = tFile(tFile::kDocumentsDirectory, "").directoryListing();
}

void MyInboxScreen::storeListOfServerFilesEntry()
{
    mServerFileList = JSONUtil::explodeCommas(JSONUtil::extract(mListInboxJSON)["list"]);

    std::vector<std::string> serverListMod;
    for(size_t i = 0; i < mServerFileList.size(); i++)
    {
        if (mServerFileList[i] != "." && mServerFileList[i] != "..")
        {
            serverListMod.push_back(mServerFileList[i]);
        }
    }

    mServerFileList = serverListMod;
}

void MyInboxScreen::calculateMergedFilesEntry()
{
    std::set<std::string> mergedSet;

    mergedSet.insert(mLocalFileList.begin(), mLocalFileList.end());
    mergedSet.insert(mServerFileList.begin(), mServerFileList.end());

    mMergedFileList.clear();
    mMergedFileList.insert(mMergedFileList.end(), mergedSet.begin(), mergedSet.end());
}

void MyInboxScreen::copyDownloadToLocalFilesEntry()
{
    tFile(tFile::kTemporaryDirectory, mMergedFileList[mItemSelected].c_str()).rename(tFile::kDocumentsDirectory, mMergedFileList[mItemSelected].c_str());
    mLocalFileList.push_back(mMergedFileList[mItemSelected]);
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
            mMergedFileList[mItemSelected].c_str());

    URLLoader::getInstance()->loadFile(buf, tFile(tFile::kTemporaryDirectory, mMergedFileList[mItemSelected].c_str()));
}

#pragma mark User Interface
void MyInboxScreen::updateMergedTableEntry()
{
    std::sort(mMergedFileList.rbegin(), mMergedFileList.rend());
    [gAppDelegateInstance setMyInboxTable:mMergedFileList];
}

void MyInboxScreen::setWaitForDownloadEntry()
{
    [gAppDelegateInstance setBlockingViewVisible:true];
}

void MyInboxScreen::setWaitForListInboxEntry()
{
    [gAppDelegateInstance setBlockingViewVisible:true];
}

void MyInboxScreen::showErrorLoadingInboxEntry()
{
    tAlert("There was an error loading inbox from the server");
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

#pragma mark Sending messages to other machines
void MyInboxScreen::sendGoPlayToVCEntry()
{
    bool existsOnServer = std::find(mServerFileList.begin(), mServerFileList.end(), mMergedFileList[mItemSelected]) != mServerFileList.end();

    this->tSubject<const MemoAppMessage&>::notify(MemoAppMessage(MemoApp::kGoPlay, mMergedFileList[mItemSelected], existsOnServer));
}

#pragma mark State wiring
void MyInboxScreen::CallEntry()
{
	switch(mState)
	{
		case kCalculateMergedFiles: calculateMergedFilesEntry(); break;
		case kCopyDownloadToLocalFiles: copyDownloadToLocalFilesEntry(); break;
		case kDoesSelectedItemExistLocally: doesSelectedItemExistLocallyEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kMakeListOfLocalFiles: makeListOfLocalFilesEntry(); break;
		case kSendDownloadRequestToServer: sendDownloadRequestToServerEntry(); break;
		case kSendGoPlayToVC: sendGoPlayToVCEntry(); break;
		case kSendListInboxToServer: sendListInboxToServerEntry(); break;
		case kServerErrorIdle: serverErrorIdleEntry(); break;
		case kSetWaitForDownload: setWaitForDownloadEntry(); break;
		case kSetWaitForListInbox: setWaitForListInboxEntry(); break;
		case kShowErrorLoadingInbox: showErrorLoadingInboxEntry(); break;
		case kShowRetryDownload: showRetryDownloadEntry(); break;
		case kShowRetryListInbox: showRetryListInboxEntry(); break;
		case kShowServerError: showServerErrorEntry(); break;
		case kStart: startEntry(); break;
		case kStoreListOfServerFiles: storeListOfServerFilesEntry(); break;
		case kUpdateMergedTable: updateMergedTableEntry(); break;
		case kWasListInboxValid: wasListInboxValidEntry(); break;
		default: break;
	}
}

void MyInboxScreen::CallExit()
{
}

int  MyInboxScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kCalculateMergedFiles) && (evt == kNext)) return kUpdateMergedTable; else
	if ((mState == kCopyDownloadToLocalFiles) && (evt == kNext)) return kSendGoPlayToVC; else
	if ((mState == kDoesSelectedItemExistLocally) && (evt == kNo)) return kSetWaitForDownload; else
	if ((mState == kDoesSelectedItemExistLocally) && (evt == kYes)) return kSendGoPlayToVC; else
	if ((mState == kIdle) && (evt == kItemSelected)) return kDoesSelectedItemExistLocally; else
	if ((mState == kMakeListOfLocalFiles) && (evt == kNext)) return kSetWaitForListInbox; else
	if ((mState == kSendDownloadRequestToServer) && (evt == kFail)) return kShowRetryDownload; else
	if ((mState == kSendDownloadRequestToServer) && (evt == kSuccess)) return kCopyDownloadToLocalFiles; else
	if ((mState == kSendListInboxToServer) && (evt == kFail)) return kShowRetryListInbox; else
	if ((mState == kSendListInboxToServer) && (evt == kSuccess)) return kWasListInboxValid; else
	if ((mState == kServerErrorIdle) && (evt == kItemSelected)) return kShowServerError; else
	if ((mState == kSetWaitForDownload) && (evt == kNext)) return kSendDownloadRequestToServer; else
	if ((mState == kSetWaitForListInbox) && (evt == kNext)) return kSendListInboxToServer; else
	if ((mState == kShowErrorLoadingInbox) && (evt == kYes)) return kShowServerError; else
	if ((mState == kShowRetryDownload) && (evt == kNo)) return kIdle; else
	if ((mState == kShowRetryDownload) && (evt == kYes)) return kSetWaitForDownload; else
	if ((mState == kShowRetryListInbox) && (evt == kNo)) return kShowServerError; else
	if ((mState == kShowRetryListInbox) && (evt == kYes)) return kSetWaitForListInbox; else
	if ((mState == kShowServerError) && (evt == kYes)) return kServerErrorIdle; else
	if ((mState == kStart) && (evt == kNext)) return kMakeListOfLocalFiles; else
	if ((mState == kStoreListOfServerFiles) && (evt == kNext)) return kCalculateMergedFiles; else
	if ((mState == kUpdateMergedTable) && (evt == kNext)) return kIdle; else
	if ((mState == kWasListInboxValid) && (evt == kNo)) return kShowErrorLoadingInbox; else
	if ((mState == kWasListInboxValid) && (evt == kYes)) return kStoreListOfServerFiles;

	return kInvalidState;
}

bool MyInboxScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kCalculateMergedFiles:
		case kCopyDownloadToLocalFiles:
		case kMakeListOfLocalFiles:
		case kSetWaitForDownload:
		case kSetWaitForListInbox:
		case kStart:
		case kStoreListOfServerFiles:
		case kUpdateMergedTable:
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
    [gAppDelegateInstance setBlockingViewVisible:false];

    switch (msg.mEvent)
    {
        case URLLoaderEvent::kLoadFail: process(kFail); break;
        case URLLoaderEvent::kLoadedString:
        {
            switch (getState())
            {
                case kSendListInboxToServer:
                    mListInboxJSON = msg.mString;
                    break;

                default:
                    break;
            }
            process(kSuccess);
        }
            break;

        case URLLoaderEvent::kLoadedFile: process(kSuccess); break;
            
        default:
            break;
    }
}

