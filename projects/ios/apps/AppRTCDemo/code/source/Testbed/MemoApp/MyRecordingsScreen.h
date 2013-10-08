#pragma once

#include <queue>

class MyRecordingsScreenMessage;
class MemoEvent;

class MyRecordingsScreen
:   public tMealy,
    public tObserver<const MyRecordingsScreenMessage&>,
    public tObserver<const MemoEvent&>,
    public Screen
{
protected:
    std::vector<std::string> mRecordingsTable;
    tUInt32 mItemSelected;

public:
	MyRecordingsScreen();
	~MyRecordingsScreen();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void idleEntry();
	void sendGoPlayToVCEntry();
	void updateMyRecordingsTableEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kItemSelected,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kEnd,
		kIdle,
		kSendGoPlayToVC,
		kUpdateMyRecordingsTable,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const MyRecordingsScreenMessage& msg);
	void update(const MemoEvent& msg);
};

class MyRecordingsScreenMessage
{
public:
	MyRecordingsScreen::EventType				mEvent;
	tSubject<const MyRecordingsScreenMessage&>*	mSource;

public:
	MyRecordingsScreenMessage(MyRecordingsScreen::EventType newEvent, tSubject<const MyRecordingsScreenMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


