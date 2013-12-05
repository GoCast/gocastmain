#pragma once

#include <queue>

class ContactsScreenMessage;
class GCTEvent;

class ContactsScreen
:   public tMealy,
    public Screen,
    public tObserver<const ContactsScreenMessage&>,
    public tObserver<const GCTEvent&>
{
protected:

public:
	ContactsScreen();
	~ContactsScreen();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void idleEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kEnd,
		kIdle,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const ContactsScreenMessage& msg);
    void update(const GCTEvent& msg);
};

class ContactsScreenMessage
{
public:
	ContactsScreen::EventType				mEvent;
	tSubject<const ContactsScreenMessage&>*	mSource;

public:
	ContactsScreenMessage(ContactsScreen::EventType newEvent, tSubject<const ContactsScreenMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


