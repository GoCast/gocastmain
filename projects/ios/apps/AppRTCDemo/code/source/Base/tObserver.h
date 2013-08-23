/*
 observer_pattern.h by TJ Grant (tjgrant@tatewake.com)
 
 This implementation of the "observer pattern" implements a C++ template-based observer.
 Thread-safe as long as notify and update methods are wrapped in thread-aware code.
 
 //--
 
 Copyright (c) 2011-02-01 TJ Grant (tjgrant@tatewake.com)
 
 Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 and associated documentation files (the "Software"), to deal in the Software without restriction,
 including without limitation the rights to use, copy, modify, merge, publish, distribute,
 sublicense, and/or sell copies of the Software, and to permit persons to whom the Software
 is furnished to do so, subject to the following conditions:
 
 The above copyright notice and this permission notice shall be included in all copies or
 substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
 BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 
 */

#pragma once

#include <list>
#include <algorithm>

template<class MSGTYPE> class tSubject;
template<class MSGTYPE> class tObserver;

template<class MSGTYPE>
class tSubject
{
protected:
    std::list<tObserver<MSGTYPE>*> mObservers;
    bool                           mCurrentlyNotifying;
    bool*                          mSubjectDeletedPtr;
    
    void AttachObserver(tObserver<MSGTYPE>* newOb) { mObservers.push_back(newOb); }

    void DetachObserver(tObserver<MSGTYPE>* newOb)
    {
        //If we're notifying, take the observer out of the list gently by NULLing it.
        if (!mCurrentlyNotifying)
        {
            mObservers.erase(find(mObservers.begin(), mObservers.end(), newOb));
        }
        else
        {
            typename std::list<tObserver<MSGTYPE>*>::iterator iter = find(mObservers.begin(), mObservers.end(), newOb);
            (*iter) = NULL;
        }
    }
    
public:
    tSubject() : mCurrentlyNotifying(false), mSubjectDeletedPtr(NULL) { }
    virtual ~tSubject();
    
    void attach(tObserver<MSGTYPE>* newOb);
    void detach(tObserver<MSGTYPE>* newOb);
    void detachAll();
    void notify(MSGTYPE msg);

    friend class tObserver<MSGTYPE>;
};

template<class MSGTYPE>
class tObserver
{
protected:
    std::list<tSubject<MSGTYPE>*> mSubjects;
    
    void AttachSubject(tSubject<MSGTYPE>* newSub) { mSubjects.push_back(newSub); }
    void DetachSubject(tSubject<MSGTYPE>* newSub) { mSubjects.erase(find(mSubjects.begin(), mSubjects.end(), newSub)); }
    
public:
    tObserver() { }
    virtual ~tObserver();
    
    virtual void update(MSGTYPE msg) = 0;

    friend class tSubject<MSGTYPE>;
};

#pragma mark tSubject
template<class MSGTYPE>
tSubject<MSGTYPE>::~tSubject()
{
    if (mSubjectDeletedPtr)
    {
        *mSubjectDeletedPtr = true;
    }

    for(typename std::list<tObserver<MSGTYPE>*>::iterator iter = mObservers.begin(); iter != mObservers.end(); iter++)
    {
        if (*iter)  //In the case of detach and delete at the same time, we need to check this
        {
            (*iter)->DetachSubject(this);
        }
    }
}

template<class MSGTYPE>
void tSubject<MSGTYPE>::attach(tObserver<MSGTYPE>* newOb)
{
    assert(newOb);
    assert(find(mObservers.begin(), mObservers.end(), newOb) == mObservers.end());
    
    newOb->AttachSubject(this);
    AttachObserver(newOb);
}

template<class MSGTYPE>
void tSubject<MSGTYPE>::detach(tObserver<MSGTYPE>* newOb)
{
    assert(newOb);
    assert(find(mObservers.begin(), mObservers.end(), newOb) != mObservers.end());
    
    newOb->DetachSubject(this);
    DetachObserver(newOb);
}

template<class MSGTYPE>
void tSubject<MSGTYPE>::detachAll()
{
    std::list<tObserver<MSGTYPE>*> observersCopy = mObservers;

    for(typename std::list<tObserver<MSGTYPE>*>::iterator iter = observersCopy.begin(); iter != observersCopy.end(); iter++)
    {
        detach(*iter);
    }
}

template<class MSGTYPE>
void tSubject<MSGTYPE>::notify(const MSGTYPE msg)
{
    bool subjectDeleted = false;

    mCurrentlyNotifying = true;
    mSubjectDeletedPtr = &subjectDeleted;

    typename std::list<tObserver<MSGTYPE>*>::iterator iter = mObservers.begin();
    typename std::list<tObserver<MSGTYPE>*>::iterator iterEnd = mObservers.end();
    for( ; iter != iterEnd; iter++)
    {
        if (*iter)                  //If the observer wasn't removed, call its notify.
        {
            (*iter)->update(msg);
        }
        if (subjectDeleted)         //If our own destructor was called during this notify
        {
            return;                 //Our context is gone (all members), and we have to get out now
        }
    }

    mSubjectDeletedPtr = NULL;
    mCurrentlyNotifying = false;

    mObservers.remove(NULL);  //Remove all NULLs from observers list
}

#pragma mark tObserver
template<class MSGTYPE>
tObserver<MSGTYPE>::~tObserver()
{
    for(typename std::list<tSubject<MSGTYPE>*>::iterator iter = mSubjects.begin(); iter != mSubjects.end(); iter++)
    {
        (*iter)->DetachObserver(this);
    }
}

//template<class MSGTYPE>
//void tObserver<MSGTYPE>::update(const MSGTYPE msg)
//{
//    //printf("%p - %s : %d\n", (void*)((unsigned long long)(void*)this & 0xff), "update", msg);
//}

