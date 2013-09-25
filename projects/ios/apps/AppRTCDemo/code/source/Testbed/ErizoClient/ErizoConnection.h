#pragma once

class ErizoConnection
{
public:
    ErizoConnection(void* spec);

public:
    bool getUserMedia(void* config, void* callback, void* error);
};

