#pragma once

#include <queue>

class AppFlowMessage;

class AppFlow
:   public tObserver<const AppFlowMessage&>,
    public tObserver<const CallcastEvent&>
{
protected:
    std::string mNickname;
    std::string mRoomname;

public:
    AppFlow();
    ~AppFlow();

protected:
    void endEntry();
    void loadLoginScreenEntry();
    void showWaitingForLoginEntry();
    void showWhiteboardEntry();
    void startEntry();
    void waitForWebViewLoadedEntry();

    void endExit();
    void loadLoginScreenExit();
    void showWaitingForLoginExit();
    void showWhiteboardExit();
    void startExit();
    void waitForWebViewLoadedExit();

    void invalidStateEntry() { assert("Attempted to enter an invalid state." && 0); }
    void invalidStateExit()  { assert("Attempted to exit an invalid state." && 0); }

public:
	enum EventType
	{
		kInvalidEvent = 0,
		kLoginPressed,
		kLoginSuccess,
		kNext,
		kQuit,
		kWebViewLoaded,
	};

	enum StateType
	{
		kInvalidState = 0,
		kEnd,
		kLoadLoginScreen,
		kShowWaitingForLogin,
		kShowWhiteboard,
		kStart,
		kWaitForWebViewLoaded,
	};

	static const StateType kInitialState = kStart;

#if DEBUG
	static const char* NameForEvent(const EventType evt)
	{
		static const char* names[] =
		{
			"**invalidEvent**",
			"loginPressed",
			"loginSuccess",
			"next",
			"quit",
			"webViewLoaded",
		};
		return names[(evt < 0) ? kInvalidEvent : (evt > (sizeof(names) / sizeof(const char*))) ? kInvalidEvent : evt];
	};

	static const char* NameForState(const StateType node)
	{
		static const char* names[] =
		{
			"**invalidState**",
			"end",
			"loadLoginScreen",
			"showWaitingForLogin",
			"showWhiteboard",
			"start",
			"waitForWebViewLoaded",
		};
		return names[(node < 0) ? kInvalidState : (node > (sizeof(names) / sizeof(const char*))) ? kInvalidState : node];
	};
#endif

protected:
	typedef void (AppFlow::*callfn) ();

	void CallEntry()
	{
		static const callfn fns[] =
		{
			&AppFlow::invalidStateEntry,
			&AppFlow::endEntry,
			&AppFlow::loadLoginScreenEntry,
			&AppFlow::showWaitingForLoginEntry,
			&AppFlow::showWhiteboardEntry,
			&AppFlow::startEntry,
			&AppFlow::waitForWebViewLoadedEntry,
		};

		(this->*fns[(mState < 0) ? kInvalidState : (mState > (sizeof(fns) / sizeof(callfn))) ? kInvalidState : mState])();
	}
	void CallExit()
	{
		static const callfn fns[] =
		{
			&AppFlow::invalidStateExit,
			&AppFlow::endExit,
			&AppFlow::loadLoginScreenExit,
			&AppFlow::showWaitingForLoginExit,
			&AppFlow::showWhiteboardExit,
			&AppFlow::startExit,
			&AppFlow::waitForWebViewLoadedExit,
		};

		(this->*fns[(mState < 0) ? kInvalidState : (mState > (sizeof(fns) / sizeof(callfn))) ? kInvalidState : mState])();
	}

	StateType StateTransitionFunction(const EventType evt) const
	{
		if ((mState == kLoadLoginScreen) && (evt == kLoginPressed)) return kShowWaitingForLogin;
		if ((mState == kLoadLoginScreen) && (evt == kQuit)) return kEnd;
		if ((mState == kShowWaitingForLogin) && (evt == kLoginSuccess)) return kShowWhiteboard;
		if ((mState == kShowWaitingForLogin) && (evt == kQuit)) return kEnd;
		if ((mState == kShowWhiteboard) && (evt == kQuit)) return kEnd;
		if ((mState == kStart) && (evt == kNext)) return kWaitForWebViewLoaded;
		if ((mState == kWaitForWebViewLoaded) && (evt == kQuit)) return kEnd;
		if ((mState == kWaitForWebViewLoaded) && (evt == kWebViewLoaded)) return kLoadLoginScreen;

		assert("Event is invalid for this state" && 0);

		return kInvalidState;
	}

	bool HasEdgeNamedNext() const
	{
		switch (mState)
		{
			case kStart:
				return true;

			default: break;
		}
		return false;
	}

protected:
    std::queue<EventType>   mReentrantQueue;
    StateType               mState;
    EventType               mImmediateEvent;
    bool                    mHasImmediateEvent;
    bool*                   mMachineDestroyedPtr;

protected:
    void ConstructMachine()
    {
        mState = AppFlow::kInitialState;
        mHasImmediateEvent = false;
        mMachineDestroyedPtr = NULL;

        CallEntry();

        if (HasEdgeNamedNext())
        {
            RunEvent(AppFlow::kNext);
        }
    }

    void DestructMachine()
    {
        if (mMachineDestroyedPtr)
        {
            *mMachineDestroyedPtr = true;
        }
        else
        {
            process(AppFlow::kQuit);
        }
    }

    bool RunEvent(const EventType& evt)
    {
        bool machineDestroyed = false;
        mMachineDestroyedPtr = &machineDestroyed;

        setImmediateEvent(evt);

        while (mHasImmediateEvent)
        {
            mHasImmediateEvent = false;

            CallExit();

            if (machineDestroyed) { return true; }
#if DEBUG && 1
            StateType newState = StateTransitionFunction(mImmediateEvent);
            printf("%s[%p]: %s X %s -> %s\n", "AppFlow", this, AppFlow::NameForState(mState), AppFlow::NameForEvent(mImmediateEvent), AppFlow::NameForState(newState));
            mState = newState;
#else
            mState = StateTransitionFunction(mImmediateEvent);
#endif
            assert(mState != kInvalidState);
            CallEntry();

            if (machineDestroyed) { return true; }

            if (HasEdgeNamedNext())
            {
                setImmediateEvent(kNext);
            }
        }

        mMachineDestroyedPtr = NULL;

        return false;
    }

public:
    StateType getState() const { return mState; }

    void setImmediateEvent(const EventType evt)
    {
        assert(!mHasImmediateEvent);

        mHasImmediateEvent = true;
        mImmediateEvent = evt;
    }

    void process(const EventType evt)
    {
        bool empty = mReentrantQueue.empty();

        mReentrantQueue.push(evt);

        if (empty)
        {
            while (!mReentrantQueue.empty())
            {
                bool machineDestroyed = RunEvent(mReentrantQueue.front());
                if (machineDestroyed) { return; }
                mReentrantQueue.pop();
            }
        }
    }

    void update(const AppFlowMessage& msg);
    void update(const CallcastEvent& msg);

//void AppFlow::update(const AppFlowMessage& msg)
//{
//    process(msg.event);
//}
};

class AppFlowMessage
{
public:
    AppFlow::EventType                event;
    tSubject<const AppFlowMessage&>*   source;

public:
    AppFlowMessage(AppFlow::EventType evt, tSubject<const AppFlowMessage&>* src = NULL) : event(evt), source(src) { }
};

