#include "pcthreadsafemessagequeue.h"

#define CHECK_RET(cond, val, retval) if(val != (cond)) {return retval;}

namespace GoCast
{
    namespace PeerConnectionTest
    {
        ThreadSafeMessageQueue::ThreadSafeMessageQueue()
        {
            pthread_mutex_init(&m_deqMutex, NULL);
        }

        ThreadSafeMessageQueue::~ThreadSafeMessageQueue()
        {
            pthread_mutex_destroy(&m_deqMutex);
        }

        bool ThreadSafeMessageQueue::Post(ParsedMessage& msg)
        {
            int ret = pthread_mutex_lock(&m_deqMutex);
            CHECK_RET(ret, 0, false);

            m_deq.push_back(msg);

            ret = pthread_mutex_unlock(&m_deqMutex);
            CHECK_RET(ret, 0, false);

            return true;
        }

        bool ThreadSafeMessageQueue::GetNext(ParsedMessage& msg)
        {
            int ret = pthread_mutex_lock(&m_deqMutex);
            CHECK_RET(ret, 0, false);

            if(false == m_deq.empty())
            {
                msg = m_deq.front();
                m_deq.pop_front();
            }

            ret = pthread_mutex_unlock(&m_deqMutex);
            CHECK_RET(ret, 0, false);

            return true;
        }
    }
}

