#include "Base/package.h"

#define kNEXT -1
#define kSTART 0x01

#pragma mark Machine construct / destruct
void tMealy::ConstructMachine()
{
    mState = kSTART;
    mHasImmediateEvent      = false;
    mEndEntryCalled         = false;
    mMachineDestroyedPtr    = NULL;

    CallEntry();

    if (HasEdgeNamedNext())
    {
        RunEvent(kNEXT);
    }
}

void tMealy::DestructMachine()
{
    if (mMachineDestroyedPtr)
    {
        *mMachineDestroyedPtr = true;
    }

    EndEntryHelper();
}

#pragma mark Processing events
bool tMealy::RunEvent(const int& evt)
{
    bool machineDestroyed = false;
    mMachineDestroyedPtr = &machineDestroyed;

    SetImmediateEvent(evt);

    while (mHasImmediateEvent)
    {
        mHasImmediateEvent = false;

        CallExit();

        if (machineDestroyed) { return true; }

        mState = StateTransitionFunction(mImmediateEvent);

        CallEntry();

        if (machineDestroyed) { return true; }

        if (HasEdgeNamedNext())
        {
            SetImmediateEvent(kNEXT);
        }
    }

    mMachineDestroyedPtr = NULL;

    return false;
}

void tMealy::SetImmediateEvent(const int evt)
{
    assert(!mHasImmediateEvent);

    mHasImmediateEvent = true;
    mImmediateEvent = evt;
}

void tMealy::EndEntryHelper()
{
    if (!mEndEntryCalled)
    {
        endEntry();
        mEndEntryCalled = true;
    }
}

#pragma mark ctor / dtor

tMealy::tMealy()
{
};

tMealy::~tMealy()
{
};

#pragma mark Public methods

int tMealy::getState() const
{
    return mState;
}

void tMealy::process(const int evt)
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
