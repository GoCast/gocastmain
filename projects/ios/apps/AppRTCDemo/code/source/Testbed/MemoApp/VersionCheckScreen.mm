#include "Base/package.h"
#include "Io/package.h"

#include "package.h"

#pragma mark Constructor / Destructor
VersionCheckScreen::VersionCheckScreen()
{
	ConstructMachine();
}

VersionCheckScreen::~VersionCheckScreen()
{
	DestructMachine();
}

#pragma mark Start / End / Invalid
void VersionCheckScreen::startEntry()
{
    URLLoader::getInstance()->attach(this);
    MemoEventManager::getInstance()->attach(this);

    [gAppDelegateInstance setVersionCheckScreenVisible:true];
    [gAppDelegateInstance setRetryVersionCheckButtonEnabled:false];
}

void VersionCheckScreen::endEntry()
{
    [gAppDelegateInstance setVersionCheckScreenVisible:false];
}

void VersionCheckScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Idling
void VersionCheckScreen::idleEntry()
{
    [gAppDelegateInstance setRetryVersionCheckButtonEnabled:true];
}

void VersionCheckScreen::idleExit()
{
    [gAppDelegateInstance setRetryVersionCheckButtonEnabled:true];
}

#pragma mark Queries
void VersionCheckScreen::isThisClientCompatibleEntry()
{
    bool result = false;

    if (JSONUtil::extract(mVersionRequiredJSON)["status"].mString == std::string("success"))
    {
        if (atoi(JSONUtil::extract(mVersionRequiredJSON)["version"].mString.c_str()) == 2)
        {
            result = true;
        }
    }

    SetImmediateEvent(result ? kYes : kNo);
}

void VersionCheckScreen::wasLastRunOldVersionEntry()
{
    tFile tokenFile(tFile::kPreferencesDirectory, "versiontoken.txt");
    bool tokenExists = tokenFile.exists();
    bool result = true;

    if (tokenExists)
    {
        if (atoi(std::string(tokenFile).c_str()) == 2)
        {
            result = false;
        }
    }

    SetImmediateEvent(result ? kYes : kNo);
}

#pragma mark Actions
void VersionCheckScreen::sendVersionRequiredRequestEntry()
{
    URLLoader::getInstance()->loadString(kMemoAppServerURL"?action=versionRequired");
}

void VersionCheckScreen::deleteAllLocalFilesEntry()
{
    tFile prefsDir(tFile::kPreferencesDirectory, "");

    std::vector<std::string> fileList = prefsDir.directoryListing();

    for(size_t i = 0; i < fileList.size(); i++)
    {
        tFile(tFile::kPreferencesDirectory, fileList[i]).remove();
    }

    tFile docsDir(tFile::kDocumentsDirectory, "");

    fileList = docsDir.directoryListing();

    for(size_t i = 0; i < fileList.size(); i++)
    {
        tFile(tFile::kDocumentsDirectory, fileList[i]).remove();
    }
}

void VersionCheckScreen::writeThisVersionTokenEntry()
{
    tFile(tFile::kPreferencesDirectory, "versiontoken.txt").write("2");
}

#pragma mark User Interface
void VersionCheckScreen::showRetryVersionEntry()
{
    tConfirm("Couldn't contact server, retry version check?");
}

#pragma mark Sending messages to other machines
void VersionCheckScreen::sendFailToVCEntry()
{
    this->tSubject<const MemoAppMessage&>::notify(MemoAppMessage(MemoApp::kFail));
}

void VersionCheckScreen::sendSuccessToVCEntry()
{
    this->tSubject<const MemoAppMessage&>::notify(MemoAppMessage(MemoApp::kSuccess));
}

#pragma mark State wiring
void VersionCheckScreen::CallEntry()
{
	switch(mState)
	{
		case kDeleteAllLocalFiles: deleteAllLocalFilesEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kIsThisClientCompatible: isThisClientCompatibleEntry(); break;
		case kSendFailToVC: sendFailToVCEntry(); break;
		case kSendSuccessToVC: sendSuccessToVCEntry(); break;
		case kSendVersionRequiredRequest: sendVersionRequiredRequestEntry(); break;
		case kShowRetryVersion: showRetryVersionEntry(); break;
		case kStart: startEntry(); break;
		case kWasLastRunOldVersion: wasLastRunOldVersionEntry(); break;
		case kWriteThisVersionToken: writeThisVersionTokenEntry(); break;
		default: break;
	}
}

void VersionCheckScreen::CallExit()
{
	switch(mState)
	{
		case kIdle: idleExit(); break;
		default: break;
	}
}

int  VersionCheckScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kDeleteAllLocalFiles) && (evt == kNext)) return kWriteThisVersionToken; else
	if ((mState == kIdle) && (evt == kRetry)) return kSendVersionRequiredRequest; else
	if ((mState == kIsThisClientCompatible) && (evt == kNo)) return kSendFailToVC; else
	if ((mState == kIsThisClientCompatible) && (evt == kYes)) return kWasLastRunOldVersion; else
	if ((mState == kSendVersionRequiredRequest) && (evt == kFail)) return kShowRetryVersion; else
	if ((mState == kSendVersionRequiredRequest) && (evt == kSuccess)) return kIsThisClientCompatible; else
	if ((mState == kShowRetryVersion) && (evt == kNo)) return kIdle; else
	if ((mState == kShowRetryVersion) && (evt == kYes)) return kSendVersionRequiredRequest; else
	if ((mState == kStart) && (evt == kNext)) return kSendVersionRequiredRequest; else
	if ((mState == kWasLastRunOldVersion) && (evt == kNo)) return kSendSuccessToVC; else
	if ((mState == kWasLastRunOldVersion) && (evt == kYes)) return kDeleteAllLocalFiles; else
	if ((mState == kWriteThisVersionToken) && (evt == kNext)) return kSendSuccessToVC;

	return kInvalidState;
}

bool VersionCheckScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kDeleteAllLocalFiles:
		case kStart:
		case kWriteThisVersionToken:
			return true;
		default: break;
	}
	return false;
}

#pragma mark Messages
void VersionCheckScreen::update(const VersionCheckScreenMessage& msg)
{
	process(msg.mEvent);
}

void VersionCheckScreen::update(const MemoEvent& msg)
{
    switch (msg.mEvent)
    {
        case MemoEvent::kRetryVersionCheckPressed: process(kRetry); break;

        case MemoEvent::kOKYesAlertPressed: process(kYes); break;
        case MemoEvent::kNoAlertPressed:    process(kNo); break;

        default:
            break;
    }
}

void VersionCheckScreen::update(const URLLoaderEvent& msg)
{
    switch (msg.mEvent)
    {
        case URLLoaderEvent::kLoadFail: process(kFail); break;
        case URLLoaderEvent::kLoadedString:
        {
            switch (getState())
            {
                case kSendVersionRequiredRequest:
                    mVersionRequiredJSON = msg.mString;
                    break;

                default:
                    break;
            }
            process(kSuccess);
        }
            break;
            
        default:
            break;
    }
}

