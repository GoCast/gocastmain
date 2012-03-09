#ifndef PCTHREADSAFEMESSAGEQUEUE_H_
#define PCTHREADSAFEMESSAGEQUEUE_H_

#include <deque>
#include <map>
#include <string>
#include <pthread.h>

typedef std::map<std::string, std::string> ParsedMessage;

namespace GoCast
{
    namespace PeerConnectionTest
    {
        class ThreadSafeMessageQueue
        {
            public:
                ThreadSafeMessageQueue();
                virtual ~ThreadSafeMessageQueue();
                bool Post(ParsedMessage& msg);
                bool GetNext(ParsedMessage& msg);

            protected:
                std::deque<ParsedMessage> m_deq;
                pthread_mutex_t m_deqMutex;
        };
    }
}

#endif

