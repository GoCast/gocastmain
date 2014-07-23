#pragma once

#include <queue>

class tMealy
{
protected:
    std::queue<int>   mReentrantQueue;
    int               mState;
    int               mImmediateEvent;
    bool              mHasImmediateEvent;
    bool              mEndEntryCalled;
    bool*             mMachineDestroyedPtr;

protected:
    void ConstructMachine();
    void DestructMachine();
    bool RunEvent(const int& evt);
    void SetImmediateEvent(const int evt);
    void EndEntryHelper();

	virtual void CallEntry() = 0;
	virtual void CallExit() = 0;
	virtual int  StateTransitionFunction(const int evt) const = 0;
	virtual bool HasEdgeNamedNext() const = 0;
    virtual void endEntry() = 0;

public:
    tMealy();
    virtual ~tMealy();

public:
    int getState() const;
    void process(const int evt);
};

