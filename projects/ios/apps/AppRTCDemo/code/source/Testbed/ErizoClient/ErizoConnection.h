#pragma once

class ErizoConnection
{
public:
    ErizoConnection(void* spec);

public:
    static void getUserMedia(void* that, fnMediaStreamPtr callback, fnMediaStreamPtr error);
};

