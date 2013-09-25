#include "Base/package.h"

#include "package.h"
#include "AppDelegate.h"

ErizoEventDispatcher::ErizoEventDispatcher()
{

}

ErizoEventDispatcher::~ErizoEventDispatcher()
{

}

void ErizoEventDispatcher::addEventListener(const std::string& eventType, void* that, fnEventPtr listener)
{
    mEventListeners[eventType].push_back(std::pair<void*, fnEventPtr>(that, listener));
}

void ErizoEventDispatcher::removeEventListener(const std::string& eventType, void* that, fnEventPtr listener)
{
    mEventListeners[eventType].remove(std::pair<void*, fnEventPtr>(that, listener));
}

void ErizoEventDispatcher::dispatchEvent(const ErizoLicodeEvent* event)
{
    NSLog(@"Event: %s", event->mType.c_str());

    std::list<std::pair<void*, fnEventPtr> >& listRef = mEventListeners[event->mType];

    for(std::list<std::pair<void*, fnEventPtr> >::iterator iter = listRef.begin(); iter != listRef.end(); iter++)
    {
        (*iter).second((*iter).first, event);
    }
}
