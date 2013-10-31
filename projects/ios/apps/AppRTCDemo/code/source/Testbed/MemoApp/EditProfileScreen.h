#pragma once

class EditProfileScreenMessage;
class MemoEvent;

class EditProfileScreen
:   public tMealy,
public tObserver<const EditProfileScreenMessage&>,
public tObserver<const MemoEvent&>,
public tObserver<const URLLoaderEvent&>,
public Screen
{
protected:
    JSONObject mGetProfileJSON;
    JSONObject mUpdateProfileJSON;

public:
	EditProfileScreen();
	~EditProfileScreen();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void idleEntry();
	void sendGetProfileToServerEntry();
	void sendUpdateProfileToServerEntry();
	void serverErrorIdleEntry();
	void setWaitForGetProfileEntry();
	void setWaitForUpdateProfileEntry();
	void showErrorGettingProfileEntry();
	void showErrorUpdatingProfileEntry();
	void showProfileUpdatedSuccessfullyEntry();
	void showRetryGetProfileEntry();
	void showRetryUpdateProfileEntry();
	void showServerErrorEntry();
	void updateKanjiAndKanaEntry();
	void wasGetProfileValidEntry();
	void wasUpdateProfileSuccessfulEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kFail,
		kNo,
		kSaveProfile,
		kSuccess,
		kYes,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kEnd,
		kIdle,
		kSendGetProfileToServer,
		kSendUpdateProfileToServer,
		kServerErrorIdle,
		kSetWaitForGetProfile,
		kSetWaitForUpdateProfile,
		kShowErrorGettingProfile,
		kShowErrorUpdatingProfile,
		kShowProfileUpdatedSuccessfully,
		kShowRetryGetProfile,
		kShowRetryUpdateProfile,
		kShowServerError,
		kUpdateKanjiAndKana,
		kWasGetProfileValid,
		kWasUpdateProfileSuccessful,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const EditProfileScreenMessage& msg);
	void update(const MemoEvent& msg);
	void update(const URLLoaderEvent& msg);
};

class EditProfileScreenMessage
{
public:
	EditProfileScreen::EventType				mEvent;
	tSubject<const EditProfileScreenMessage&>*	mSource;

public:
	EditProfileScreenMessage(EditProfileScreen::EventType newEvent, tSubject<const EditProfileScreenMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


