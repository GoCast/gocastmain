#pragma once

#include <queue>

class SettingsTabMessage;
class GCTEvent;

class SettingsTab
:   public tMealy,
    public Tab,
    public tObserver<const SettingsTabMessage&>,
    public tObserver<const GCTEvent&>
{
protected:

public:
	SettingsTab();
	~SettingsTab();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void changeRegisteredNameIdleEntry();
	void pushChangeRegisteredNameEntry();
	void settingsIdleEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kItemSelected,
		kPopHappened,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kChangeRegisteredNameIdle,
		kEnd,
		kPushChangeRegisteredName,
		kSettingsIdle,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const SettingsTabMessage& msg);
    void update(const GCTEvent& msg);
};

class SettingsTabMessage
{
public:
	SettingsTab::EventType				mEvent;
	tSubject<const SettingsTabMessage&>*	mSource;

public:
	SettingsTabMessage(SettingsTab::EventType newEvent, tSubject<const SettingsTabMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


