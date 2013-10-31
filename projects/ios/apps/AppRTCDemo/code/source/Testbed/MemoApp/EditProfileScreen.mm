#include "Base/package.h"
#include "Io/package.h"

#include "package.h"

#pragma mark Constructor / Destructor
EditProfileScreen::EditProfileScreen()
{
	ConstructMachine();
}

EditProfileScreen::~EditProfileScreen()
{
	DestructMachine();
}

#pragma mark Start / End / Invalid
void EditProfileScreen::startEntry()
{
    MemoEventManager::getInstance()->attach(this);
    URLLoader::getInstance()->attach(this);

    [gAppDelegateInstance setEditProfileScreenVisible:true];
    [gAppDelegateInstance setNavigationBarTitle:"Edit Profile"];
}

void EditProfileScreen::endEntry()
{
    [gAppDelegateInstance setEditProfileScreenVisible:false];
}

void EditProfileScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Idling
void EditProfileScreen::idleEntry()
{
}

void EditProfileScreen::serverErrorIdleEntry()
{
}

#pragma mark Queries
void EditProfileScreen::wasGetProfileValidEntry()
{
    bool result = false;

    if (mGetProfileJSON["status"].mString == std::string("success"))
    {
        result = true;
    }

    SetImmediateEvent(result ? kYes : kNo);
}

void EditProfileScreen::wasUpdateProfileSuccessfulEntry()
{
    bool result = false;

    if (mUpdateProfileJSON["status"].mString == std::string("success"))
    {
        result = true;
    }

    SetImmediateEvent(result ? kYes : kNo);
}

#pragma mark Actions
void EditProfileScreen::sendGetProfileToServerEntry()
{
    char buf[512];

    sprintf(buf, "%s?action=getProfile&name=%s",
            kMemoAppServerURL,
            std::string(tFile(tFile::kPreferencesDirectory, "logintoken.txt")).c_str());

    URLLoader::getInstance()->loadString(buf);
}

void EditProfileScreen::sendUpdateProfileToServerEntry()
{
    tFile tempProfile(tFile::kTemporaryDirectory, "profile.json");

    JSONObject newProfile;
    newProfile["profile"] = JSONObject();

    newProfile["profile"].mObject["kanji"]  = [gAppDelegateInstance getKanjiName];
    newProfile["profile"].mObject["kana"]   = [gAppDelegateInstance getKanaName];

    if (newProfile.find("status") != newProfile.end())
    {
        newProfile.erase(newProfile.find("status"));
    }

    tempProfile.write(JSONValue(newProfile).toString());

    std::vector<std::pair<std::string, std::string> > params;

    params.push_back(std::pair<std::string, std::string>("action", "updateProfile"));
    params.push_back(std::pair<std::string, std::string>("name", std::string(tFile(tFile::kPreferencesDirectory, "logintoken.txt"))));

    params.push_back(std::pair<std::string, std::string>("MAX_FILE_SIZE", "1048576"));

    URLLoader::getInstance()->postFile(kMemoAppServerURL, params, tempProfile);
}


void EditProfileScreen::updateKanjiAndKanaEntry()
{
    [gAppDelegateInstance setKanjiName:mGetProfileJSON["profile"].mObject["kanji"].mString];
    [gAppDelegateInstance setKanaName:mGetProfileJSON["profile"].mObject["kana"].mString];
}

#pragma mark User Interface
void EditProfileScreen::setWaitForGetProfileEntry()
{
    [gAppDelegateInstance setBlockingViewVisible:true];
}

void EditProfileScreen::setWaitForUpdateProfileEntry()
{
    [gAppDelegateInstance setBlockingViewVisible:true];
}

void EditProfileScreen::showErrorGettingProfileEntry()
{
    tAlert("Error getting profile.");
}

void EditProfileScreen::showErrorUpdatingProfileEntry()
{
    tAlert("Error updating profile.");
}

void EditProfileScreen::showProfileUpdatedSuccessfullyEntry()
{
    tAlert("Profile updated successfully.");
}

void EditProfileScreen::showRetryGetProfileEntry()
{
    tConfirm("Couldn't contact server, retry get profile?");
}

void EditProfileScreen::showRetryUpdateProfileEntry()
{
    tConfirm("Couldn't contact server, retry update profile?");
}

void EditProfileScreen::showServerErrorEntry()
{
    tAlert("There was an unrecoverable server error.");
}

#pragma mark State wiring
void EditProfileScreen::CallEntry()
{
	switch(mState)
	{
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kSendGetProfileToServer: sendGetProfileToServerEntry(); break;
		case kSendUpdateProfileToServer: sendUpdateProfileToServerEntry(); break;
		case kServerErrorIdle: serverErrorIdleEntry(); break;
		case kSetWaitForGetProfile: setWaitForGetProfileEntry(); break;
		case kSetWaitForUpdateProfile: setWaitForUpdateProfileEntry(); break;
		case kShowErrorGettingProfile: showErrorGettingProfileEntry(); break;
		case kShowErrorUpdatingProfile: showErrorUpdatingProfileEntry(); break;
		case kShowProfileUpdatedSuccessfully: showProfileUpdatedSuccessfullyEntry(); break;
		case kShowRetryGetProfile: showRetryGetProfileEntry(); break;
		case kShowRetryUpdateProfile: showRetryUpdateProfileEntry(); break;
		case kShowServerError: showServerErrorEntry(); break;
		case kStart: startEntry(); break;
		case kUpdateKanjiAndKana: updateKanjiAndKanaEntry(); break;
		case kWasGetProfileValid: wasGetProfileValidEntry(); break;
		case kWasUpdateProfileSuccessful: wasUpdateProfileSuccessfulEntry(); break;
		default: break;
	}
}

void EditProfileScreen::CallExit()
{
}

int  EditProfileScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kIdle) && (evt == kSaveProfile)) return kSetWaitForUpdateProfile; else
	if ((mState == kSendGetProfileToServer) && (evt == kFail)) return kShowRetryGetProfile; else
	if ((mState == kSendGetProfileToServer) && (evt == kSuccess)) return kWasGetProfileValid; else
	if ((mState == kSendUpdateProfileToServer) && (evt == kFail)) return kShowRetryUpdateProfile; else
	if ((mState == kSendUpdateProfileToServer) && (evt == kSuccess)) return kWasUpdateProfileSuccessful; else
	if ((mState == kServerErrorIdle) && (evt == kSaveProfile)) return kShowServerError; else
	if ((mState == kSetWaitForGetProfile) && (evt == kNext)) return kSendGetProfileToServer; else
	if ((mState == kSetWaitForUpdateProfile) && (evt == kNext)) return kSendUpdateProfileToServer; else
	if ((mState == kShowErrorGettingProfile) && (evt == kYes)) return kShowServerError; else
	if ((mState == kShowErrorUpdatingProfile) && (evt == kYes)) return kShowServerError; else
	if ((mState == kShowProfileUpdatedSuccessfully) && (evt == kYes)) return kIdle; else
	if ((mState == kShowRetryGetProfile) && (evt == kNo)) return kShowServerError; else
	if ((mState == kShowRetryGetProfile) && (evt == kYes)) return kSetWaitForGetProfile; else
	if ((mState == kShowRetryUpdateProfile) && (evt == kYes)) return kSendUpdateProfileToServer; else
	if ((mState == kShowServerError) && (evt == kYes)) return kServerErrorIdle; else
	if ((mState == kStart) && (evt == kNext)) return kSetWaitForGetProfile; else
	if ((mState == kUpdateKanjiAndKana) && (evt == kNext)) return kIdle; else
	if ((mState == kWasGetProfileValid) && (evt == kNo)) return kShowErrorGettingProfile; else
	if ((mState == kWasGetProfileValid) && (evt == kYes)) return kUpdateKanjiAndKana; else
	if ((mState == kWasUpdateProfileSuccessful) && (evt == kNo)) return kShowErrorUpdatingProfile; else
	if ((mState == kWasUpdateProfileSuccessful) && (evt == kYes)) return kShowProfileUpdatedSuccessfully;

	return kInvalidState;
}

bool EditProfileScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kSetWaitForGetProfile:
		case kSetWaitForUpdateProfile:
		case kStart:
		case kUpdateKanjiAndKana:
			return true;
		default: break;
	}
	return false;
}

#pragma mark Messages
void EditProfileScreen::update(const EditProfileScreenMessage& msg)
{
	process(msg.mEvent);
}

void EditProfileScreen::update(const MemoEvent& msg)
{
    switch (msg.mEvent)
    {
        case MemoEvent::kSaveProfilePressed:    process(kSaveProfile); break;
        case MemoEvent::kOKYesAlertPressed:     process(kYes); break;
        case MemoEvent::kNoAlertPressed:        process(kNo); break;

        default:
            break;
    }
}

void EditProfileScreen::update(const URLLoaderEvent& msg)
{
    [gAppDelegateInstance setBlockingViewVisible:false];

    switch (msg.mEvent)
    {
        case URLLoaderEvent::kLoadFail: process(kFail); break;
        case URLLoaderEvent::kLoadedString:
        {
            switch (getState())
            {
                case kSendGetProfileToServer:
                    mGetProfileJSON = JSONUtil::extract(msg.mString);
                    break;

                case kSendUpdateProfileToServer:
                    mUpdateProfileJSON = JSONUtil::extract(msg.mString);
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
