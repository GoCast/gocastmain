#include "pcsocketserver.h"
#include "pcobserver.h"

namespace GoCast
{
    namespace PeerConnectionTest
    {
        PCSocketServer::PCSocketServer()
        : m_pThread(talk_base::Thread::Current())
        , m_pObs(NULL)
        {
        }

        PCSocketServer::~PCSocketServer()
        {
        }

        void PCSocketServer::RegisterPCObserver(PCObserver* pObs)
        {
            m_pObs = pObs;
        }

        bool PCSocketServer::Wait(int cms, bool bProcessIO)
        {
            bool bQuit = false;
            bool bStatus = m_pObs->HandleNextMessage(bQuit);

            if(true == bStatus && true == bQuit)
            {
                m_pThread->Quit();
            }

            return talk_base::PhysicalSocketServer::Wait(20, bProcessIO);
        }
    }
}

