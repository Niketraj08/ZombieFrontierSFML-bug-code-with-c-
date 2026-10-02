CXX = g++
CXXFLAGS = -std=c++17 -O3 -Wall -Wextra
LIBS = -lsfml-graphics -lsfml-window -lsfml-system

TARGET = ZombieFrontier
SRCS = src/main.cpp

all: $(TARGET)

$(TARGET): $(SRCS)
	$(CXX) $(CXXFLAGS) $(SRCS) -o $(TARGET) $(LIBS)

clean:
	rm -f $(TARGET) *.o

run: $(TARGET)
	./$(TARGET)

.PHONY: all clean run
