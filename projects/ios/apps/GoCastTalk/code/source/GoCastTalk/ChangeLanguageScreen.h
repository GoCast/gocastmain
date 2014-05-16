#pragma once

@class ChangeLanguageVC;

class ChangeLanguageScreenMessage;

class ChangeLanguageScreen
:   public tMealy,
    public tObserver<const ChangeLanguageScreenMessage&>,
    public tObserver<const GCTEvent&>
{
protected:
    ChangeLanguageVC*   mPeer;

public:
	ChangeLanguageScreen(ChangeLanguageVC* newVC);
	~ChangeLanguageScreen();

    void englishPressed();
    void japanesePressed();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void idleEntry();
	void peerPopSelfEntry();
	void sendLanguageChangedToVCEntry();
	void setLanguageToEnglishEntry();
	void setLanguageToJapaneseEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kEnglishSelected,
		kJapaneseSelected,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kEnd,
		kIdle,
		kPeerPopSelf,
		kSendLanguageChangedToVC,
		kSetLanguageToEnglish,
		kSetLanguageToJapanese,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const ChangeLanguageScreenMessage& msg);
	void update(const GCTEvent& msg);
};

class ChangeLanguageScreenMessage
{
public:
	ChangeLanguageScreen::EventType				mEvent;
	tSubject<const ChangeLanguageScreenMessage&>*	mSource;

public:
	ChangeLanguageScreenMessage(ChangeLanguageScreen::EventType newEvent, tSubject<const ChangeLanguageScreenMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


