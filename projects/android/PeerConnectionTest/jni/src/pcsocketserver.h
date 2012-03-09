#ifndef PCSOCKETSERVER_H_
#define PCSOCKETSERVER_H_

#include "talk/base/thread.h"
#include "talk/base/physicalsocketserver.h"

namespace GoCast
{
    namespace PeerConnectionTest
    {
        class PCObserver;

        class PCSocketServer: public talk_base::PhysicalSocketServer
        {
            public:
                PCSocketServer();
                virtual ~PCSocketServer();
                void RegisterPCObserver(PCObserver* pObs);
                virtual bool Wait(int cms, bool bProcessIO);

            protected:
                talk_base::Thread* m_pThread;
                PCObserver* m_pObs;
        };
    }
}

#endif

