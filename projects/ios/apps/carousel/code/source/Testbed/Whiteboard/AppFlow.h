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
    void showBlankSpotEntry();
    void showChatSpotEntry();
    void showLoggingInViewEntry();
    void showLoginViewEntry();
    void showNicknameInUseEntry();
    void showWebLoadingViewEntry();
    void showWhiteboardSpotEntry();
    void startEntry();

    void endExit();
    void showBlankSpotExit();
    void showChatSpotExit();
    void showLoggingInViewExit();
    void showLoginViewExit();
    void showNicknameInUseExit();
    void showWebLoadingViewExit();
    void showWhiteboardSpotExit();
    void startExit();

    void invalidStateEntry() { assert("Attempted to enter an invalid state." && 0); }
    void invalidStateExit()  { assert("Attempted to exit an invalid state." && 0); }

public:
	enum EventType
	{
		kInvalidEvent = 0,
		kLoginPressed,
		kLoginSuccess,
		kNext,
		kNickInUse,
		kOkay,
		kQuit,
		kShowBlank,
		kShowChat,
		kShowWhiteboard,
		kWebViewLoaded,
	};

	enum StateType
	{
		kInvalidState = 0,
		kEnd,
		kShowBlankSpot,
		kShowChatSpot,
		kShowLoggingInView,
		kShowLoginView,
		kShowNicknameInUse,
		kShowWebLoadingView,
		kShowWhiteboardSpot,
		kStart,
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
			"nickInUse",
			"okay",
			"quit",
			"showBlank",
			"showChat",
			"showWhiteboard",
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
			"showBlankSpot",
			"showChatSpot",
			"showLoggingInView",
			"showLoginView",
			"showNicknameInUse",
			"showWebLoadingView",
			"showWhiteboardSpot",
			"start",
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
			&AppFlow::showBlankSpotEntry,
			&AppFlow::showChatSpotEntry,
			&AppFlow::showLoggingInViewEntry,
			&AppFlow::showLoginViewEntry,
			&AppFlow::showNicknameInUseEntry,
			&AppFlow::showWebLoadingViewEntry,
			&AppFlow::showWhiteboardSpotEntry,
			&AppFlow::startEntry,
		};

		(this->*fns[(mState < 0) ? kInvalidState : (mState > (sizeof(fns) / sizeof(callfn))) ? kInvalidState : mState])();
	}
	void CallExit()
	{
		static const callfn fns[] =
		{
			&AppFlow::invalidStateExit,
			&AppFlow::endExit,
			&AppFlow::showBlankSpotExit,
			&AppFlow::showChatSpotExit,
			&AppFlow::showLoggingInViewExit,
			&AppFlow::showLoginViewExit,
			&AppFlow::showNicknameInUseExit,
			&AppFlow::showWebLoadingViewExit,
			&AppFlow::showWhiteboardSpotExit,
			&AppFlow::startExit,
		};

		(this->*fns[(mState < 0) ? kInvalidState : (mState > (sizeof(fns) / sizeof(callfn))) ? kInvalidState : mState])();
	}

	StateType StateTransitionFunction(const EventType evt) const
	{
		if ((mState == kShowBlankSpot) && (evt == kNickInUse)) return kShowNicknameInUse;
		if ((mState == kShowBlankSpot) && (evt == kQuit)) return kEnd;
		if ((mState == kShowBlankSpot) && (evt == kShowChat)) return kShowChatSpot;
		if ((mState == kShowBlankSpot) && (evt == kShowWhiteboard)) return kShowWhiteboardSpot;
		if ((mState == kShowChatSpot) && (evt == kNickInUse)) return kShowNicknameInUse;
		if ((mState == kShowChatSpot) && (evt == kQuit)) return kEnd;
		if ((mState == kShowChatSpot) && (evt == kShowBlank)) return kShowBlankSpot;
		if ((mState == kShowChatSpot) && (evt == kShowWhiteboard)) return kShowWhiteboardSpot;
		if ((mState == kShowLoggingInView) && (evt == kLoginSuccess)) return kShowBlankSpot;
		if ((mState == kShowLoggingInView) && (evt == kNickInUse)) return kShowNicknameInUse;
		if ((mState == kShowLoggingInView) && (evt == kQuit)) return kEnd;
		if ((mState == kShowLoginView) && (evt == kLoginPressed)) return kShowLoggingInView;
		if ((mState == kShowLoginView) && (evt == kQuit)) return kEnd;
		if ((mState == kShowNicknameInUse) && (evt == kOkay)) return kShowLoginView;
		if ((mState == kShowNicknameInUse) && (evt == kQuit)) return kEnd;
		if ((mState == kShowWebLoadingView) && (evt == kQuit)) return kEnd;
		if ((mState == kShowWebLoadingView) && (evt == kWebViewLoaded)) return kShowLoginView;
		if ((mState == kShowWhiteboardSpot) && (evt == kNickInUse)) return kShowNicknameInUse;
		if ((mState == kShowWhiteboardSpot) && (evt == kQuit)) return kEnd;
		if ((mState == kShowWhiteboardSpot) && (evt == kShowBlank)) return kShowBlankSpot;
		if ((mState == kShowWhiteboardSpot) && (evt == kShowChat)) return kShowChatSpot;
		if ((mState == kStart) && (evt == kNext)) return kShowWebLoadingView;

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

