cmake_minimum_required(VERSION 3.22)
project(ZombieFrontier LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include(FetchContent)
FetchContent_Declare(
    SFML
    GIT_REPOSITORY https://github.com/SFML/SFML.git
    GIT_TAG 3.0.2
)
FetchContent_MakeAvailable(SFML)

if(EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/src/main.cpp")
    set(MAIN_SRC src/main.cpp)
else()
    set(MAIN_SRC native/main.cpp)
endif()

add_executable(ZombieFrontier ${MAIN_SRC})
target_link_libraries(ZombieFrontier PRIVATE SFML::Graphics SFML::Window SFML::System)
