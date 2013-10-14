#pragma once

class JSONUtil
{
public:
    static std::map<std::string, std::string> extract(const std::string& newJSONString);

    static std::vector<std::string> explodeCommas(const std::string& newString);
};

