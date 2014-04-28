#pragma once

@class GroupViewVC;

class GroupViewScreenMessage;

class GroupViewScreen
: public tMealy,
// public tSubject<const OtherGroupViewScreenMessage&>,
  public tObserver<const GroupViewScreenMessage&>
{
protected:
    GroupViewVC*    mPeer;
    JSONObject      mInitObject;

public:
	GroupViewScreen(GroupViewVC* newVC, const JSONObject& initObject);
	~GroupViewScreen();

    void pressSendMessage();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void idleEntry();
	void sendNewMessageToGroupToVCEntry();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kSendMessagePressed,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kEnd,
		kIdle,
		kSendNewMessageToGroupToVC,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const GroupViewScreenMessage& msg);
};

class GroupViewScreenMessage
{
public:
	GroupViewScreen::EventType				mEvent;
	tSubject<const GroupViewScreenMessage&>*	mSource;

public:
	GroupViewScreenMessage(GroupViewScreen::EventType newEvent, tSubject<const GroupViewScreenMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


