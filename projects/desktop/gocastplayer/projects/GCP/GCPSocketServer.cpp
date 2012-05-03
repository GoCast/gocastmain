//  File GCPSocketServer.cpp
//  Project: GoCastPlayer

#include "GCPSocketServer.h"

namespace GoCast
{
    SocketServer::SocketServer()
    : m_pThread(talk_base::Thread::Current())
    {

    }

    SocketServer::~SocketServer()
    {
        
    }
}

