cmake_minimum_required(VERSION 3.22)

project(ZombieFrontier LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

include(FetchContent)

FetchContent_Declare(
    SFML
    GIT_REPOSITORY https://github.com/SFML/SFML.git
    GIT_TAG 3.0.2
    GIT_SHALLOW TRUE
)

FetchContent_MakeAvailable(SFML)

add_executable(ZombieFrontier
    src/main.cpp
)

set_target_properties(ZombieFrontier PROPERTIES
    WIN32_EXECUTABLE OFF
)

target_link_libraries(ZombieFrontier PRIVATE
    SFML::Graphics
    SFML::Window
    SFML::System
)

if(MINGW)
    target_link_options(ZombieFrontier PRIVATE -mconsole)
endif()

if(WIN32)
    add_custom_command(TARGET ZombieFrontier POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E make_directory
                "$<TARGET_FILE_DIR:ZombieFrontier>/assets"

        COMMAND ${CMAKE_COMMAND} -E copy_directory
                "${CMAKE_SOURCE_DIR}/assets"
                "$<TARGET_FILE_DIR:ZombieFrontier>/assets"
    )
endif()