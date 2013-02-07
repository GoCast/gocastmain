#pragma once

#include <queue>
#include <list>
#include <map>

class CarouselAppMessage;
class tSGViewEvent;

class CarouselApp
:   public tObserver<const CarouselAppMessage&>,
    public tObserver<const CallcastEvent&>,
    public tObserver<const tSGViewEvent&>
{
protected:
    std::vector<tPoint2f>   mWhiteBoardVerts;
    std::vector<tPoint2f>   mWhiteBoardTexCoords;
    tProgram*               mSpriteProgram;
    tTexture*               mWhiteboardTexture;

    std::string                     mNickname;
    std::string                     mRoomname;
    std::list<int32_t>              mSpots;
    std::map<int32_t, tSurface*>    mSurfaces;
    uint32_t                        mSpotFinger;

    tPoint2f                mCurDrawPoint;
    tColor4b                mReceivePenColor;
    float                   mReceivePenSize;

    bool                    mInitialized;

protected:
    void createResources();
    void configureNodes();

public:
    CarouselApp();
    ~CarouselApp();

    void onInitView();
    void onResizeView(const tDimension2f& newSize);
    void onRedrawView(float time);

    void onAddSpot(const std::string& newType, const int32_t& newID);
    void onRemoveSpot(const int32_t& newID);
    void onOkayButton();
    void onPrevButton();
    void onNextButton();

    void onSave(const tColor4b& nc, const float& np);
    void onMoveTo(const tPoint2f& pt);
    void onLineTo(const tPoint2f& pt);
    void onStroke();

protected:
    void endEntry();
    void showBlankSpotEntry();
    void showLoggingInViewEntry();
    void showLoginViewEntry();
    void showNicknameInUseEntry();
    void showWebLoadingViewEntry();
    void showWhiteboardSpotEntry();
    void startEntry();

    void endExit();
    void showBlankSpotExit();
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
		kShowWhiteboard,
		kWebViewLoaded,
	};

	enum StateType
	{
		kInvalidState = 0,
		kEnd,
		kShowBlankSpot,
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
	typedef void (CarouselApp::*callfn) ();

	void CallEntry()
	{
		static const callfn fns[] =
		{
			&CarouselApp::invalidStateEntry,
			&CarouselApp::endEntry,
			&CarouselApp::showBlankSpotEntry,
			&CarouselApp::showLoggingInViewEntry,
			&CarouselApp::showLoginViewEntry,
			&CarouselApp::showNicknameInUseEntry,
			&CarouselApp::showWebLoadingViewEntry,
			&CarouselApp::showWhiteboardSpotEntry,
			&CarouselApp::startEntry,
		};

		(this->*fns[(mState < 0) ? kInvalidState : (mState > (sizeof(fns) / sizeof(callfn))) ? kInvalidState : mState])();
	}
	void CallExit()
	{
		static const callfn fns[] =
		{
			&CarouselApp::invalidStateExit,
			&CarouselApp::endExit,
			&CarouselApp::showBlankSpotExit,
			&CarouselApp::showLoggingInViewExit,
			&CarouselApp::showLoginViewExit,
			&CarouselApp::showNicknameInUseExit,
			&CarouselApp::showWebLoadingViewExit,
			&CarouselApp::showWhiteboardSpotExit,
			&CarouselApp::startExit,
		};

		(this->*fns[(mState < 0) ? kInvalidState : (mState > (sizeof(fns) / sizeof(callfn))) ? kInvalidState : mState])();
	}

	StateType StateTransitionFunction(const EventType evt) const
	{
		if ((mState == kShowBlankSpot) && (evt == kNickInUse)) return kShowNicknameInUse;
		if ((mState == kShowBlankSpot) && (evt == kQuit)) return kEnd;
		if ((mState == kShowBlankSpot) && (evt == kShowBlank)) return kShowBlankSpot;
		if ((mState == kShowBlankSpot) && (evt == kShowWhiteboard)) return kShowWhiteboardSpot;
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
		if ((mState == kShowWhiteboardSpot) && (evt == kShowWhiteboard)) return kShowWhiteboardSpot;
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
        mState = CarouselApp::kInitialState;
        mHasImmediateEvent = false;
        mMachineDestroyedPtr = NULL;

        CallEntry();

        if (HasEdgeNamedNext())
        {
            RunEvent(CarouselApp::kNext);
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
            process(CarouselApp::kQuit);
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
            printf("%s[%p]: %s X %s -> %s\n", "CarouselApp", this, CarouselApp::NameForState(mState), CarouselApp::NameForEvent(mImmediateEvent), CarouselApp::NameForState(newState));
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

    void update(const CarouselAppMessage& msg);
    void update(const CallcastEvent& msg);
    void update(const tSGViewEvent& msg);

//void CarouselApp::update(const CarouselAppMessage& msg)
//{
//    process(msg.event);
//}
};

class CarouselAppMessage
{
public:
    CarouselApp::EventType                event;
    tSubject<const CarouselAppMessage&>*   source;

public:
    CarouselAppMessage(CarouselApp::EventType evt, tSubject<const CarouselAppMessage&>* src = NULL) : event(evt), source(src) { }
};

