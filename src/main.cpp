
#include <SFML/Graphics.hpp>
#include <SFML/Window.hpp>
#include <SFML/System.hpp>
#include <algorithm>
#include <cmath>
#include <fstream>
#include <iostream>
#include <random>
#include <string>
#include <vector>

using namespace std;

constexpr unsigned WINDOW_W=1280;
constexpr unsigned WINDOW_H=720;
constexpr float WORLD_W=3200.f;
constexpr float WORLD_H=2200.f;

mt19937 rng(20261001);

int rnd(int a,int b){
    return uniform_int_distribution<int>(a,b)(rng);
}

float frnd(float a,float b){
    return uniform_real_distribution<float>(a,b)(rng);
}

float len(sf::Vector2f v){
    return sqrt(v.x*v.x+v.y*v.y);
}

sf::Vector2f norm(sf::Vector2f v){
    float l=len(v);
    return l<0.001f?sf::Vector2f{0,0}:v/l;
}

float dist(sf::Vector2f a,sf::Vector2f b){
    return len(a-b);
}

struct Weapon{
    string name;
    int damage=10;
    float delay=.2f;
    int magazine=10;
    int ammo=10;
    int reserve=50;
    int maxReserve=100;
    int price=0;
    bool owned=false;
};

struct Player{
    sf::Vector2f pos{1600,1100};
    float speed=280;
    float radius=20;
    int hp=100;
    int maxHp=100;
    int armor=0;
    int level=1;
    int xp=0;
    int gold=150;
    int score=0;
    int kills=0;
    int grenades=3;
    int medkits=3;
    int weapon=0;
    float fireTimer=0;
    float grenadeTimer=0;
    float invuln=0;
};

struct Enemy{
    sf::Vector2f pos;
    int type=0;
    float radius=18;
    float speed=80;
    int hp=50;
    int maxHp=50;
    int damage=10;
    int xp=20;
    int gold=20;
    float attackTimer=0;
    float flash=0;
};

struct Bullet{
    sf::Vector2f pos;
    sf::Vector2f vel;
    int damage=10;
    float life=2;
    float radius=5;
    bool enemy=false;
};

struct Pickup{
    sf::Vector2f pos;
    int type=0;
    int value=10;
    float pulse=0;
};

struct Particle{
    sf::Vector2f pos;
    sf::Vector2f vel;
    float life=1;
    float maxLife=1;
    float size=4;
    sf::Color color=sf::Color::White;
};

struct Quest{
    string title;
    string description;
    int target=1;
    int progress=0;
    int gold=0;
    int xp=0;
    bool complete=false;
};

class Game{
public:
    Game();
    void run();

private:
    sf::RenderWindow window;
    sf::Font font;
    bool fontReady=false;
    sf::View camera;
    sf::Clock clock;

    Player player;
    vector<Weapon> weapons;
    vector<Enemy> enemies;
    vector<Bullet> bullets;
    vector<Pickup> pickups;
    vector<Particle> particles;
    vector<Quest> quests;

    int screen=0;
    int menu=0;
    int wave=1;
    int killsWave=0;

    bool paused=false;
    bool shop=false;
    bool inventory=false;
    bool questLog=false;
    bool stats=false;
    bool gameOver=false;
    bool victory=false;

    float spawnTimer=0;
    float bossTimer=0;
    bool mouseHeld=false;
    bool mousePressed=false;
    sf::Vector2f mouseWorld;

    void init();
    void loadFont();
    void initWeapons();
    void initQuests();
    void reset();

    void events();
    void key(sf::Keyboard::Scancode k);
    void update(float dt);
    void updateGame(float dt);
    void updatePlayer(float dt);
    void updateEnemies(float dt);
    void updateBullets(float dt);
    void updatePickups(float dt);
    void updateParticles(float dt);
    void updateCamera();

    void shoot();
    void reload();
    void grenade();
    void heal();

    void spawnEnemy(int type=-1);
    void spawnBoss();
    void addEnemy(sf::Vector2f p,int type);
    void enemyAttack(Enemy& e);
    void hurtPlayer(int amount);
    void hurtEnemy(Enemy& e,int amount);
    void killEnemy(size_t i);

    void pickup(sf::Vector2f p,int type,int value);
    void explosion(sf::Vector2f p,float radius,int damage);
    void particlesAt(sf::Vector2f p,sf::Color c,int count);
    void muzzle(sf::Vector2f p,sf::Vector2f d);

    void questsUpdate();
    void levelUp();
    void nextWave();

    void save();
    void load();

    void render();
    void menuRender();
    void worldRender();
    void helpRender();
    void aboutRender();

    void grid();
    void decorations();
    void playerRender();
    void enemyRender();
    void bulletRender();
    void pickupRender();
    void particleRender();
    void hud();
    void crosshair();
    void pauseRender();
    void shopRender();
    void inventoryRender();
    void questRender();
    void statsRender();
    void deathRender();
    void victoryRender();

    void text(string s,float x,float y,unsigned size,sf::Color c=sf::Color::White);
    void center(string s,float x,float y,unsigned size,sf::Color c=sf::Color::White);
    void panel(float x,float y,float w,float h,sf::Color c,sf::Color outline);
    void bar(float x,float y,float w,float h,float value,float maximum,sf::Color fill,sf::Color back);
    void button(float x,float y,float w,float h,string s,bool selected);

    bool blocked(sf::Vector2f p,float r) const;
    sf::Vector2f spawnPosition() const;
    sf::Vector2f mousePosition() const;

    Weapon& weapon();
    const Weapon& weapon() const;
    float damageMultiplier() const;
    int neededXp() const;

    sf::Color enemyColor(int type) const;
    string enemyName(int type) const;
    int baseHp(int type) const;
    int baseDamage(int type) const;
    float baseSpeed(int type) const;
    int baseXp(int type) const;
    int baseGold(int type) const;

    void shopWeapon(int i);
    void shopAmmo();
    void shopMedkit();
    void shopArmor();

    void drawWeaponList();
    void drawQuestList();
    void drawStatList();

    void addGold(int n);
    void addXp(int n);
    void addScore(int n);
    void fullHeal();
    void refillAmmo();
    void refillEnergy();
    bool bossUnlocked() const;
    bool bossAlive() const;
    int ownedWeapons() const;
    void validate();
    void autosave();
    void respawnPlayer();
};

Game::Game(){
    init();
}

void Game::init(){
    window.create(sf::VideoMode({WINDOW_W,WINDOW_H}),"Zombie Frontier - SFML");
    window.setFramerateLimit(144);
    window.setKeyRepeatEnabled(false);
    camera=window.getDefaultView();
    loadFont();
    initWeapons();
    initQuests();
    reset();
}

void Game::loadFont(){
    vector<string> files={
        "assets/DejaVuSans.ttf",
        "assets/font.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeui.ttf"
    };
    for(const auto& f:files){
        if(font.openFromFile(f)){
            fontReady=true;
            return;
        }
    }
    cerr<<"Font not found. Put a .ttf file at assets/DejaVuSans.ttf\n";
}

void Game::initWeapons(){
    weapons={
        {"Pistol",18,.28f,12,12,72,120,0,true},
        {"Shotgun",36,.70f,6,6,36,60,450,false},
        {"Assault Rifle",24,.11f,30,30,120,240,900,false},
        {"Plasma Rifle",62,.40f,10,10,50,80,1700,false}
    };
}

void Game::initQuests(){
    quests={
        {"First Blood","Kill 5 enemies.",5,0,150,100,false},
        {"Zombie Hunter","Kill 20 enemies.",20,0,500,350,false},
        {"Survivor","Reach level 5.",5,0,750,500,false},
        {"Armed","Own 3 weapons.",3,0,900,500,false}
    };
}

void Game::reset(){
    player=Player();
    for(size_t i=0;i<weapons.size();++i){
        weapons[i].owned=(i==0);
        weapons[i].ammo=weapons[i].magazine;
    }
    initQuests();
    enemies.clear();
    bullets.clear();
    pickups.clear();
    particles.clear();
    wave=1;
    killsWave=0;
    spawnTimer=0;
    bossTimer=0;
    paused=false;
    shop=false;
    inventory=false;
    questLog=false;
    stats=false;
    gameOver=false;
    victory=false;
    screen=0;
    menu=0;
    for(int i=0;i<5;i++) spawnEnemy(i%2);
    updateCamera();
}

void Game::run(){
    while(window.isOpen()){
        events();
        float dt=min(clock.restart().asSeconds(),.05f);
        update(dt);
        render();
    }
}

void Game::events(){
    mousePressed=false;
    while(const auto e=window.pollEvent()){
        if(e->is<sf::Event::Closed>()){
            window.close();
        }
        if(const auto* k=e->getIf<sf::Event::KeyPressed>())
            key(k->scancode);
        if(e->is<sf::Event::MouseButtonPressed>())
            mousePressed=true;
    }
    mouseHeld=sf::Mouse::isButtonPressed(sf::Mouse::Button::Left);
    mouseWorld=mousePosition();
}

void Game::key(sf::Keyboard::Scancode k){
    if(screen==0){
        if(k==sf::Keyboard::Scancode::Up){
            menu=(menu+4)%5;
        }else if(k==sf::Keyboard::Scancode::Down){
            menu=(menu+1)%5;
        }else if(k==sf::Keyboard::Scancode::Enter){
            if(menu==0){reset();screen=1;}
            else if(menu==1){load();screen=1;}
            else if(menu==2)screen=2;
            else if(menu==3)screen=3;
            else window.close();
        }
        return;
    }

    if(k==sf::Keyboard::Scancode::Escape){
        if(screen==2||screen==3){
            screen=0;
            return;
        }
        if(shop||inventory||questLog||stats){
            shop=inventory=questLog=stats=false;
            return;
        }
        paused=!paused;
        return;
    }

    if(screen!=1)return;

    if(gameOver||victory){
        if(k==sf::Keyboard::Scancode::Enter)reset(),screen=1;
        return;
    }

    if(k==sf::Keyboard::Scancode::R)reload();
    if(k==sf::Keyboard::Scancode::G)grenade();
    if(k==sf::Keyboard::Scancode::H)heal();
    if(k==sf::Keyboard::Scancode::F5)save();
    if(k==sf::Keyboard::Scancode::F9)load();

    if(k==sf::Keyboard::Scancode::P)shop=!shop;
    if(k==sf::Keyboard::Scancode::I||k==sf::Keyboard::Scancode::Tab)inventory=!inventory;
    if(k==sf::Keyboard::Scancode::Q)questLog=!questLog;
    if(k==sf::Keyboard::Scancode::T)stats=!stats;
}

void Game::update(float dt){
    if(screen!=1||paused||shop||inventory||questLog||stats||gameOver||victory)return;
    updateGame(dt);
}

void Game::updateGame(float dt){
    player.fireTimer-=dt;
    player.grenadeTimer-=dt;
    player.invuln-=dt;

    updatePlayer(dt);

    if(mouseHeld)shoot();

    updateEnemies(dt);
    updateBullets(dt);
    updatePickups(dt);
    updateParticles(dt);
    updateCamera();

    spawnTimer+=dt;

    int maxEnemies=7+wave*2;

    if(spawnTimer>max(.5f,2.1f-wave*.07f)){
        spawnTimer=0;
        if((int)enemies.size()<maxEnemies)spawnEnemy();
    }

    if(killsWave>=5+wave*2)nextWave();

    questsUpdate();
    levelUp();

    if(player.hp<=0)gameOver=true;

    if(bossUnlocked()&&wave>=5&&!bossAlive()&&bossTimer<=0){
        spawnBoss();
        bossTimer=999999;
    }
}

void Game::updatePlayer(float dt){
    sf::Vector2f d{0,0};

    if(sf::Keyboard::isKeyPressed(sf::Keyboard::Key::W))d.y-=1;
    if(sf::Keyboard::isKeyPressed(sf::Keyboard::Key::S))d.y+=1;
    if(sf::Keyboard::isKeyPressed(sf::Keyboard::Key::A))d.x-=1;
    if(sf::Keyboard::isKeyPressed(sf::Keyboard::Key::D))d.x+=1;

    d=norm(d);
    sf::Vector2f n=player.pos+d*player.speed*dt;

    if(!blocked({n.x,player.pos.y},player.radius))player.pos.x=n.x;
    if(!blocked({player.pos.x,n.y},player.radius))player.pos.y=n.y;

    player.pos.x=max(player.radius,min(WORLD_W-player.radius,player.pos.x));
    player.pos.y=max(player.radius,min(WORLD_H-player.radius,player.pos.y));
}

void Game::shoot(){
    Weapon& w=weapon();
    if(player.fireTimer>0)return;

    if(w.ammo<=0){
        reload();
        return;
    }

    sf::Vector2f d=norm(mouseWorld-player.pos);
    if(len(d)<.01f)return;

    w.ammo--;
    player.fireTimer=w.delay;

    int damage=(int)(w.damage*damageMultiplier());

    if(w.name=="Shotgun"){
        for(int i=-2;i<=2;i++){
            float a=atan2(d.y,d.x)+i*.07f;
            sf::Vector2f v{cos(a),sin(a)};
            bullets.push_back({player.pos+v*25.f,v*900.f,damage,1.3f,5,false});
        }
    }else{
        bullets.push_back({player.pos+d*25.f,d*1050.f,damage,1.7f,5,false});
    }

    muzzle(player.pos+d*28.f,d);
}

void Game::reload(){
    Weapon& w=weapon();
    int need=w.magazine-w.ammo;
    if(need<=0||w.reserve<=0)return;
    int take=min(need,w.reserve);
    w.ammo+=take;
    w.reserve-=take;
}

void Game::grenade(){
    if(player.grenadeTimer>0||player.grenades<=0)return;

    sf::Vector2f d=norm(mouseWorld-player.pos);
    if(len(d)<.01f)return;

    player.grenades--;
    player.grenadeTimer=.8f;
    explosion(player.pos+d*300.f,155.f,90);
}

void Game::heal(){
    if(player.medkits<=0||player.hp>=player.maxHp)return;
    player.medkits--;
    player.hp=min(player.maxHp,player.hp+50);
    particlesAt(player.pos,sf::Color(70,230,100),20);
}

void Game::updateEnemies(float dt){
    for(auto& e:enemies){
        e.attackTimer-=dt;
        e.flash-=dt;

        sf::Vector2f to=player.pos-e.pos;
        float d=len(to);

        if(d>e.radius+player.radius+8){
            sf::Vector2f v=norm(to);
            float mult=1;
            if(e.type==1)mult=1.65f;
            if(e.type==2)mult=.72f;
            if(e.type==3)mult=.62f;
            if(e.type==4)mult=.55f;

            sf::Vector2f n=e.pos+v*e.speed*mult*dt;
            if(!blocked(n,e.radius))e.pos=n;
        }else if(e.attackTimer<=0){
            enemyAttack(e);
        }

        if(e.type==2&&d<700&&e.attackTimer<=0){
            sf::Vector2f v=norm(to);
            bullets.push_back({e.pos+v*25.f,v*430.f,e.damage,2.f,6,true});
            e.attackTimer=1.5f;
        }

        if(e.type==3&&d<520&&e.attackTimer<=0){
            sf::Vector2f v=norm(to);
            for(int i=-1;i<=1;i++){
                float a=atan2(v.y,v.x)+i*.14f;
                sf::Vector2f q{cos(a),sin(a)};
                bullets.push_back({e.pos,q*470.f,e.damage,1.8f,7,true});
            }
            e.attackTimer=2.f;
        }
    }
}

void Game::enemyAttack(Enemy& e){
    int damage=e.damage;
    if(e.type==4)damage+=rnd(5,15);
    damage=max(1,damage-player.armor);
    hurtPlayer(damage);
    e.attackTimer=e.type==4?.8f:1.f;
}

void Game::hurtPlayer(int amount){
    if(player.invuln>0)return;
    player.hp=max(0,player.hp-amount);
    player.invuln=.35f;
    particlesAt(player.pos,sf::Color(255,70,70),10);
}

void Game::updateBullets(float dt){
    for(size_t i=0;i<bullets.size();){
        auto& b=bullets[i];
        b.pos+=b.vel*dt;
        b.life-=dt;
        bool remove=b.life<=0||blocked(b.pos,b.radius);

        if(!remove&&b.enemy&&dist(b.pos,player.pos)<b.radius+player.radius){
            hurtPlayer(b.damage);
            remove=true;
        }

        if(!remove&&!b.enemy){
            for(size_t j=0;j<enemies.size();j++){
                if(dist(b.pos,enemies[j].pos)<b.radius+enemies[j].radius){
                    hurtEnemy(enemies[j],b.damage);
                    if(enemies[j].hp<=0)killEnemy(j);
                    remove=true;
                    break;
                }
            }
        }

        if(remove)bullets.erase(bullets.begin()+i);
        else ++i;
    }
}

void Game::hurtEnemy(Enemy& e,int amount){
    e.hp=max(0,e.hp-amount);
    e.flash=.08f;
    particlesAt(e.pos,enemyColor(e.type),3);
}

void Game::killEnemy(size_t i){
    if(i>=enemies.size())return;

    Enemy e=enemies[i];

    player.kills++;
    killsWave++;
    addGold(e.gold);
    addXp(e.xp);
    addScore(e.xp*10);

    particlesAt(e.pos,enemyColor(e.type),28);

    int r=rnd(1,100);
    if(r<=14)pickup(e.pos,0,30);
    else if(r<=21)pickup(e.pos,1,1);
    else if(r<=28)pickup(e.pos,2,1);

    if(e.type==4){
        addGold(1500);
        addXp(1500);
        addScore(10000);
        victory=true;
    }

    enemies.erase(enemies.begin()+i);
}

void Game::updatePickups(float dt){
    for(auto& p:pickups)p.pulse+=dt*5;

    for(size_t i=0;i<pickups.size();){
        if(dist(player.pos,pickups[i].pos)<42){
            auto p=pickups[i];

            if(p.type==0){
                addGold(p.value);
                addScore(p.value*2);
            }else if(p.type==1){
                player.medkits++;
            }else{
                player.grenades++;
            }

            particlesAt(p.pos,sf::Color(255,220,70),10);
            pickups.erase(pickups.begin()+i);
        }else ++i;
    }
}

void Game::updateParticles(float dt){
    for(size_t i=0;i<particles.size();){
        auto& p=particles[i];
        p.pos+=p.vel*dt;
        p.vel*=.92f;
        p.life-=dt;
        if(p.life<=0)particles.erase(particles.begin()+i);
        else ++i;
    }
}

void Game::spawnEnemy(int type){
    if(type<0){
        int r=rnd(1,100);
        if(wave<2)type=0;
        else if(wave<4)type=r<70?0:1;
        else if(wave<7)type=r<45?0:(r<75?1:2);
        else type=r<35?0:(r<60?1:(r<85?2:3));
    }
    addEnemy(spawnPosition(),type);
}

void Game::addEnemy(sf::Vector2f p,int type){
    Enemy e;
    e.pos=p;
    e.type=type;

    float scale=1+wave*.09f;

    e.maxHp=(int)(baseHp(type)*scale);
    e.hp=e.maxHp;
    e.damage=(int)(baseDamage(type)*scale);
    e.speed=baseSpeed(type);
    e.xp=(int)(baseXp(type)*scale);
    e.gold=(int)(baseGold(type)*scale);

    if(type==0)e.radius=18;
    if(type==1)e.radius=17;
    if(type==2)e.radius=21;
    if(type==3)e.radius=29;

    if(type==4){
        e.radius=58;
        e.maxHp=2200+wave*220;
        e.hp=e.maxHp;
        e.damage=35+wave*4;
        e.speed=45;
        e.xp=1200;
        e.gold=1500;
    }

    enemies.push_back(e);
}

void Game::spawnBoss(){
    addEnemy(spawnPosition(),4);
    particlesAt(enemies.back().pos,sf::Color(190,40,230),90);
}

void Game::pickup(sf::Vector2f p,int type,int value){
    pickups.push_back({p,type,value,frnd(0,6.28f)});
}

void Game::explosion(sf::Vector2f p,float radius,int damage){
    particlesAt(p,sf::Color(255,150,30),75);

    for(size_t i=0;i<enemies.size();){
        float d=dist(p,enemies[i].pos);
        if(d<=radius+enemies[i].radius){
            float factor=1-min(1.f,d/radius);
            hurtEnemy(enemies[i],(int)(damage*factor));
            if(enemies[i].hp<=0){
                killEnemy(i);
                continue;
            }
        }
        ++i;
    }

    if(dist(p,player.pos)<radius*.3f)hurtPlayer(10);
}

void Game::particlesAt(sf::Vector2f p,sf::Color c,int count){
    for(int i=0;i<count;i++){
        float a=frnd(0,6.28318f);
        float s=frnd(40,250);
        Particle q;
        q.pos=p;
        q.vel={cos(a)*s,sin(a)*s};
        q.life=frnd(.15f,.9f);
        q.maxLife=q.life;
        q.size=frnd(2,7);
        q.color=c;
        particles.push_back(q);
    }
}

void Game::muzzle(sf::Vector2f p,sf::Vector2f d){
    for(int i=0;i<8;i++){
        float a=atan2(d.y,d.x)+frnd(-.3f,.3f);
        float s=frnd(80,250);
        Particle q;
        q.pos=p;
        q.vel={cos(a)*s,sin(a)*s};
        q.life=frnd(.04f,.15f);
        q.maxLife=q.life;
        q.size=frnd(2,5);
        q.color=sf::Color(255,220,80);
        particles.push_back(q);
    }
}

void Game::questsUpdate(){
    for(auto& q:quests){
        if(q.title=="First Blood")q.progress=player.kills;
        if(q.title=="Zombie Hunter")q.progress=player.kills;
        if(q.title=="Survivor")q.progress=player.level;
        if(q.title=="Armed")q.progress=ownedWeapons();

        if(!q.complete&&q.progress>=q.target){
            q.complete=true;
            addGold(q.gold);
            addXp(q.xp);
            addScore(q.gold*5);
            particlesAt(player.pos,sf::Color(255,220,70),30);
        }
    }
}

void Game::levelUp(){
    while(player.xp>=neededXp()){
        player.xp-=neededXp();
        player.level++;
        player.maxHp+=15;
        player.hp=player.maxHp;
        player.armor++;
        addScore(1000);
        particlesAt(player.pos,sf::Color(70,220,255),55);
    }
}

void Game::nextWave(){
    wave++;
    killsWave=0;
    player.hp=min(player.maxHp,player.hp+15);
    player.grenades++;

    for(int i=0;i<min(3,wave);i++)spawnEnemy();

    if(wave%5==0&&bossUnlocked())spawnBoss();
}

bool Game::bossUnlocked()const{
    return player.level>=5;
}

bool Game::bossAlive()const{
    for(const auto& e:enemies)if(e.type==4)return true;
    return false;
}

void Game::save(){
    ofstream out("zombie_frontier_save.dat");
    if(!out)return;

    out<<player.pos.x<<" "<<player.pos.y<<"\n";
    out<<player.hp<<" "<<player.maxHp<<" "<<player.armor<<"\n";
    out<<player.level<<" "<<player.xp<<" "<<player.gold<<" "<<player.score<<"\n";
    out<<player.kills<<" "<<player.grenades<<" "<<player.medkits<<" "<<player.weapon<<"\n";
    out<<wave<<"\n";

    for(const auto& w:weapons)
        out<<w.owned<<" "<<w.ammo<<" "<<w.reserve<<"\n";

    for(const auto& q:quests)
        out<<q.complete<<"\n";
}

void Game::load(){
    ifstream in("zombie_frontier_save.dat");
    if(!in)return;

    if(!(in>>player.pos.x>>player.pos.y))return;
    in>>player.hp>>player.maxHp>>player.armor;
    in>>player.level>>player.xp>>player.gold>>player.score;
    in>>player.kills>>player.grenades>>player.medkits>>player.weapon;
    in>>wave;

    for(auto& w:weapons)in>>w.owned>>w.ammo>>w.reserve;
    for(auto& q:quests)in>>q.complete;

    validate();

    enemies.clear();
    bullets.clear();
    pickups.clear();
    particles.clear();

    for(int i=0;i<5+wave;i++)spawnEnemy();
}

void Game::validate(){
    player.hp=max(0,min(player.hp,player.maxHp));
    player.level=max(1,player.level);
    player.gold=max(0,player.gold);
    player.grenades=max(0,player.grenades);
    player.medkits=max(0,player.medkits);
    if(player.weapon<0||player.weapon>=(int)weapons.size())player.weapon=0;
}

void Game::autosave(){
    save();
}

void Game::respawnPlayer(){
    player.pos={1600,1100};
    player.hp=player.maxHp;
}

void Game::updateCamera(){
    sf::Vector2f c=player.pos;
    float hw=WINDOW_W/2.f;
    float hh=WINDOW_H/2.f;
    c.x=max(hw,min(WORLD_W-hw,c.x));
    c.y=max(hh,min(WORLD_H-hh,c.y));
    camera.setCenter(c);
}

void Game::render(){
    window.clear(sf::Color(8,11,16));

    if(screen==0)menuRender();
    else if(screen==1)worldRender();
    else if(screen==2)helpRender();
    else aboutRender();

    window.display();
}

void Game::menuRender(){
    sf::RectangleShape bg({(float)WINDOW_W,(float)WINDOW_H});
    bg.setFillColor(sf::Color(7,10,15));
    window.draw(bg);

    for(int i=0;i<40;i++){
        sf::CircleShape s(frnd(1,3));
        s.setPosition({frnd(0,(float)WINDOW_W),frnd(0,(float)WINDOW_H)});
        s.setFillColor(sf::Color(60,70,90));
        window.draw(s);
    }

    center("ZOMBIE FRONTIER",640,105,62,sf::Color(240,65,65));
    center("GRAPHICAL SURVIVAL SHOOTER",640,175,23,sf::Color(120,210,255));

    vector<string> m={"NEW GAME","LOAD GAME","HOW TO PLAY","ABOUT","EXIT"};

    for(int i=0;i<5;i++)
        button(440,255+i*70,400,54,m[i],i==menu);

    center("C++17 + SFML 3",640,650,20,sf::Color(100,110,130));
}

void Game::worldRender(){
    window.setView(camera);
    grid();
    decorations();
    pickupRender();
    bulletRender();
    enemyRender();
    particleRender();
    playerRender();
    window.setView(window.getDefaultView());

    hud();
    crosshair();

    if(paused)pauseRender();
    if(shop)shopRender();
    if(inventory)inventoryRender();
    if(questLog)questRender();
    if(stats)statsRender();
    if(gameOver)deathRender();
    if(victory)victoryRender();
}

void Game::helpRender(){
    panel(100,60,1080,600,sf::Color(15,20,28),sf::Color(70,170,220));
    center("HOW TO PLAY",640,105,42,sf::Color(255,210,70));

    vector<string> a={
        "W A S D  - Move",
        "Mouse    - Aim",
        "Left     - Shoot",
        "R        - Reload",
        "G        - Grenade",
        "H        - Medkit",
        "P / E    - Shop",
        "I / TAB  - Inventory",
        "Q        - Quests",
        "T        - Statistics",
        "F5       - Save",
        "F9       - Load",
        "ESC      - Pause / Back"
    };

    int y=170;
    for(const auto& s:a){
        text(s,190,y,25);
        y+=32;
    }

    text("Goal: reach level 5 and defeat the Necro Lord.",650,250,24,sf::Color(255,130,100));
    text("Survive increasingly difficult waves.",650,300,22);
    text("Buy stronger weapons with gold.",650,340,22);
    text("Pickups can give gold, medkits and grenades.",650,380,22);
    text("Complete quests for bonus XP and gold.",650,420,22);
    center("ESC - Back",640,610,22,sf::Color(150,160,175));
}

void Game::aboutRender(){
    panel(100,70,1080,580,sf::Color(15,20,28),sf::Color(160,100,220));
    center("ABOUT ZOMBIE FRONTIER",640,120,42,sf::Color(200,130,255));
    center("A C++17 top-down shooter built with SFML 3.",640,210,25);
    center("Real-time movement, mouse aiming and projectile combat.",640,260,22);
    center("Enemies have different speeds, health and attack styles.",640,310,22);
    center("Includes shop, inventory, quests, waves, boss, save/load.",640,360,22);
    center("No external sprite pack is required in this version.",640,410,22,sf::Color(130,220,255));
    center("ESC - Back",640,590,22,sf::Color(150,160,175));
}

void Game::grid(){
    sf::RectangleShape floor({WORLD_W,WORLD_H});
    floor.setFillColor(sf::Color(23,28,34));
    window.draw(floor);

    for(int x=0;x<=50;x++){
        sf::Vertex v[2];
        v[0].position={x*64.f,0};
        v[1].position={x*64.f,WORLD_H};
        v[0].color=v[1].color=sf::Color(30,36,43);
        window.draw(v,2,sf::PrimitiveType::Lines);
    }

    for(int y=0;y<=34;y++){
        sf::Vertex v[2];
        v[0].position={0,y*64.f};
        v[1].position={WORLD_W,y*64.f};
        v[0].color=v[1].color=sf::Color(30,36,43);
        window.draw(v,2,sf::PrimitiveType::Lines);
    }
}

void Game::decorations(){
    for(int i=0;i<35;i++){
        float x=fmod(i*193.f,WORLD_W);
        float y=fmod(i*127.f,WORLD_H);

        sf::RectangleShape r({48,42});
        r.setPosition({x,y});
        r.setFillColor(sf::Color(38,44,51));
        r.setOutlineThickness(2);
        r.setOutlineColor(sf::Color(55,62,70));
        window.draw(r);
    }

    sf::CircleShape safe(115);
    safe.setOrigin({115,115});
    safe.setPosition({1600,1100});
    safe.setFillColor(sf::Color(20,130,170,35));
    safe.setOutlineThickness(2);
    safe.setOutlineColor(sf::Color(60,190,230,110));
    window.draw(safe);
}

void Game::playerRender(){
    sf::CircleShape p(player.radius);
    p.setOrigin({player.radius,player.radius});
    p.setPosition(player.pos);
    p.setFillColor(player.invuln>0?sf::Color::White:sf::Color(60,180,255));
    p.setOutlineThickness(3);
    p.setOutlineColor(sf::Color(180,240,255));
    window.draw(p);

    sf::Vector2f d=norm(mouseWorld-player.pos);

    sf::RectangleShape gun({34,7});
    gun.setOrigin({0,3.5f});
    gun.setPosition(player.pos);
    gun.setRotation(sf::radians(atan2(d.y,d.x)));
    gun.setFillColor(sf::Color(220,220,230));
    window.draw(gun);
}

void Game::enemyRender(){
    for(const auto& e:enemies){
        sf::CircleShape c(e.radius);
        c.setOrigin({e.radius,e.radius});
        c.setPosition(e.pos);
        c.setFillColor(e.flash>0?sf::Color::White:enemyColor(e.type));
        c.setOutlineThickness(e.type==4?5:2);
        c.setOutlineColor(e.type==4?sf::Color(255,100,255):sf::Color(255,230,230));
        window.draw(c);

        bar(e.pos.x-e.radius,e.pos.y-e.radius-13,e.radius*2,6,e.hp,e.maxHp,
            sf::Color(220,50,60),sf::Color(50,20,25));

        if(e.type==4){
            sf::CircleShape aura(e.radius+12);
            aura.setOrigin({e.radius+12,e.radius+12});
            aura.setPosition(e.pos);
            aura.setFillColor(sf::Color::Transparent);
            aura.setOutlineThickness(3);
            aura.setOutlineColor(sf::Color(190,50,220,120));
            window.draw(aura);
        }
    }
}

void Game::bulletRender(){
    for(const auto& b:bullets){
        sf::CircleShape c(b.radius);
        c.setOrigin({b.radius,b.radius});
        c.setPosition(b.pos);
        c.setFillColor(b.enemy?sf::Color(255,70,80):sf::Color(255,230,90));
        window.draw(c);
    }
}

void Game::pickupRender(){
    for(const auto& p:pickups){
        float s=10+sin(p.pulse)*3;
        sf::CircleShape c(s);
        c.setOrigin({s,s});
        c.setPosition(p.pos);

        if(p.type==0)c.setFillColor(sf::Color(255,215,50));
        else if(p.type==1)c.setFillColor(sf::Color(70,230,100));
        else c.setFillColor(sf::Color(230,100,40));

        window.draw(c);
    }
}

void Game::particleRender(){
    for(const auto& p:particles){
        sf::Color c=p.color;
        c.a=(uint8_t)(255*max(0.f,min(1.f,p.life/p.maxLife)));

        sf::CircleShape s(p.size);
        s.setOrigin({p.size,p.size});
        s.setPosition(p.pos);
        s.setFillColor(c);
        window.draw(s);
    }
}

void Game::hud(){
    sf::RectangleShape top({(float)WINDOW_W,78});
    top.setFillColor(sf::Color(8,11,17,240));
    window.draw(top);

    text("WAVE "+to_string(wave),20,12,22,sf::Color(255,210,70));
    text("LEVEL "+to_string(player.level),145,12,22,sf::Color(100,220,255));
    text("GOLD "+to_string(player.gold),285,12,22,sf::Color(255,220,80));
    text("SCORE "+to_string(player.score),420,12,22);

    text(weapon().name,590,12,22,sf::Color(170,240,190));
    text(to_string(weapon().ammo)+"/"+to_string(weapon().reserve),800,12,22);

    bar(20,48,230,16,player.hp,player.maxHp,sf::Color(70,210,90),sf::Color(55,25,30));
    text("HP",258,43,17);

    text("G "+to_string(player.grenades),920,12,20,sf::Color(255,130,70));
    text("H "+to_string(player.medkits),1020,12,20,sf::Color(90,230,120));

    text("F5 Save | F9 Load | ESC Pause",850,48,16,sf::Color(140,150,165));

    if(bossUnlocked())
        text("BOSS UNLOCKED",1080,680,17,sf::Color(255,70,220));
    else
        text("BOSS AT LEVEL 5",1050,680,17,sf::Color(150,160,175));
}

void Game::crosshair(){
    sf::Vector2i m=sf::Mouse::getPosition(window);
    float x=m.x,y=m.y;

    sf::CircleShape r(10);
    r.setOrigin({10,10});
    r.setPosition({x,y});
    r.setFillColor(sf::Color::Transparent);
    r.setOutlineThickness(2);
    r.setOutlineColor(sf::Color(255,255,255,210));
    window.draw(r);

    sf::RectangleShape h({26,2});
    h.setPosition({x-13,y-1});
    h.setFillColor(sf::Color(255,255,255,180));
    window.draw(h);

    sf::RectangleShape v({2,26});
    v.setPosition({x-1,y-13});
    v.setFillColor(sf::Color(255,255,255,180));
    window.draw(v);
}

void Game::pauseRender(){
    panel(350,175,580,370,sf::Color(8,11,17,245),sf::Color(80,150,200));
    center("PAUSED",640,225,50,sf::Color(255,210,70));
    center("ESC - Resume",640,325,25);
    center("F5 - Save",640,370,24);
    center("F9 - Load",640,415,24);
    center("I - Inventory   Q - Quests",640,460,21,sf::Color(150,210,240));
}

void Game::shopRender(){
    panel(285,85,710,595,sf::Color(12,16,23,252),sf::Color(80,200,160));
    center("ARMORY",640,120,40,sf::Color(120,240,180));
    text("Gold: "+to_string(player.gold),325,170,23,sf::Color(255,220,80));

    drawWeaponList();

    text("5. Ammo Pack - 80 gold",325,505,21);
    text("6. Medkit - 70 gold",325,545,21);
    text("7. Armor +1 - 250 gold",325,585,21);
    text("Press 1-7. ESC closes.",325,635,18,sf::Color(150,160,175));
}

void Game::drawWeaponList(){
    for(int i=0;i<(int)weapons.size();i++){
        float y=215+i*68;

        text(to_string(i+1)+". "+weapons[i].name,330,y,22);

        text("DMG "+to_string(weapons[i].damage),600,y,19,sf::Color(180,210,230));

        string status=weapons[i].owned?"OWNED":"BUY "+to_string(weapons[i].price);
        text(status,790,y,19,weapons[i].owned?sf::Color(100,230,120):sf::Color(255,210,80));
    }

    if(sf::Keyboard::isKeyPressed(sf::Keyboard::Key::Num1))shopWeapon(0);
    if(sf::Keyboard::isKeyPressed(sf::Keyboard::Key::Num2))shopWeapon(1);
    if(sf::Keyboard::isKeyPressed(sf::Keyboard::Key::Num3))shopWeapon(2);
    if(sf::Keyboard::isKeyPressed(sf::Keyboard::Key::Num4))shopWeapon(3);
    if(sf::Keyboard::isKeyPressed(sf::Keyboard::Key::Num5))shopAmmo();
    if(sf::Keyboard::isKeyPressed(sf::Keyboard::Key::Num6))shopMedkit();
    if(sf::Keyboard::isKeyPressed(sf::Keyboard::Key::Num7))shopArmor();
}

void Game::inventoryRender(){
    panel(320,100,640,500,sf::Color(12,16,23,252),sf::Color(80,150,230));
    center("INVENTORY",640,135,38,sf::Color(110,210,255));

    text("Medkits: "+to_string(player.medkits),365,195,23,sf::Color(100,230,120));
    text("Grenades: "+to_string(player.grenades),365,235,23,sf::Color(255,130,70));
    text("Weapons:",365,290,23);

    int y=335;

    for(int i=0;i<(int)weapons.size();i++){
        if(!weapons[i].owned)continue;

        sf::Color c=i==player.weapon?sf::Color(255,220,70):sf::Color(210,215,225);
        text(to_string(i+1)+". "+weapons[i].name,385,y,21,c);
        text(to_string(weapons[i].ammo)+"/"+to_string(weapons[i].reserve),760,y,20);
        y+=48;
    }

    text("Press 1-4 to equip. H uses medkit.",365,555,18,sf::Color(150,160,175));
}

void Game::questRender(){
    panel(260,70,760,610,sf::Color(12,16,23,252),sf::Color(210,170,70));
    center("QUEST LOG",640,105,38,sf::Color(255,210,80));
    drawQuestList();
}

void Game::drawQuestList(){
    int y=165;

    for(const auto& q:quests){
        sf::Color c=q.complete?sf::Color(100,240,130):sf::Color(220,225,235);

        text(q.title,315,y,23,c);
        text(q.description,315,y+31,17,sf::Color(150,160,175));

        bar(620,y+3,250,14,q.progress,q.target,
            q.complete?sf::Color(80,220,120):sf::Color(80,150,220),
            sf::Color(40,45,52));

        text(to_string(min(q.progress,q.target))+"/"+to_string(q.target),880,y-3,17);
        y+=112;
    }

    text("ESC closes",315,635,18,sf::Color(150,160,175));
}

void Game::statsRender(){
    panel(350,90,580,540,sf::Color(12,16,23,252),sf::Color(150,100,220));
    center("PLAYER STATS",640,125,38,sf::Color(190,120,255));
    drawStatList();
}

void Game::drawStatList(){
    vector<string> s={
        "Level: "+to_string(player.level),
        "XP: "+to_string(player.xp)+"/"+to_string(neededXp()),
        "HP: "+to_string(player.hp)+"/"+to_string(player.maxHp),
        "Armor: "+to_string(player.armor),
        "Kills: "+to_string(player.kills),
        "Gold: "+to_string(player.gold),
        "Score: "+to_string(player.score),
        "Wave: "+to_string(wave),
        "Weapon: "+weapon().name
    };

    int y=190;
    for(const auto& row:s){
        text(row,420,y,23);
        y+=43;
    }
    text("ESC closes",420,570,18,sf::Color(150,160,175));
}

void Game::deathRender(){
    panel(310,145,660,430,sf::Color(12,10,15,250),sf::Color(220,60,70));
    center("YOU DIED",640,205,58,sf::Color(240,60,70));
    center("The city swallowed another survivor.",640,290,23);
    center("Score: "+to_string(player.score),640,350,24,sf::Color(255,210,80));
    center("Press ENTER to restart",640,440,23,sf::Color(130,220,255));
    center("ESC returns to menu",640,490,20,sf::Color(160,165,175));
}

void Game::victoryRender(){
    panel(250,105,780,510,sf::Color(8,15,14,250),sf::Color(90,240,160));
    center("VICTORY!",640,160,64,sf::Color(100,255,160));
    center("THE NECRO LORD HAS FALLEN",640,255,28,sf::Color(255,220,90));
    center("Final Score: "+to_string(player.score),640,345,25,sf::Color(120,220,255));
    center("Kills: "+to_string(player.kills),640,390,22);
    center("Press ENTER to play again",640,485,22,sf::Color(120,240,150));
    center("ESC returns to menu",640,535,20,sf::Color(160,165,175));
}

void Game::text(string s,float x,float y,unsigned size,sf::Color c){
    if(!fontReady)return;
    sf::Text t(font,s,size);
    t.setFillColor(c);
    t.setPosition({x,y});
    window.draw(t);
}

void Game::center(string s,float x,float y,unsigned size,sf::Color c){
    if(!fontReady)return;
    sf::Text t(font,s,size);
    t.setFillColor(c);
    auto b=t.getLocalBounds();
    t.setOrigin({b.position.x+b.size.x/2,b.position.y+b.size.y/2});
    t.setPosition({x,y});
    window.draw(t);
}

void Game::panel(float x,float y,float w,float h,sf::Color c,sf::Color outline){
    sf::RectangleShape p({w,h});
    p.setPosition({x,y});
    p.setFillColor(c);
    p.setOutlineThickness(3);
    p.setOutlineColor(outline);
    window.draw(p);
}

void Game::bar(float x,float y,float w,float h,float value,float maximum,sf::Color fill,sf::Color back){
    sf::RectangleShape b({w,h});
    b.setPosition({x,y});
    b.setFillColor(back);
    window.draw(b);

    float r=maximum<=0?0:max(0.f,min(1.f,value/maximum));
    sf::RectangleShape f({w*r,h});
    f.setPosition({x,y});
    f.setFillColor(fill);
    window.draw(f);

    sf::RectangleShape o({w,h});
    o.setPosition({x,y});
    o.setFillColor(sf::Color::Transparent);
    o.setOutlineThickness(1);
    o.setOutlineColor(sf::Color(170,170,180,180));
    window.draw(o);
}

void Game::button(float x,float y,float w,float h,string s,bool selected){
    sf::RectangleShape b({w,h});
    b.setPosition({x,y});
    b.setFillColor(selected?sf::Color(45,90,120):sf::Color(25,32,42));
    b.setOutlineThickness(2);
    b.setOutlineColor(selected?sf::Color(110,220,255):sf::Color(70,80,95));
    window.draw(b);

    center(s,x+w/2,y+h/2,23,selected?sf::Color::White:sf::Color(190,195,205));
}

bool Game::blocked(sf::Vector2f p,float r)const{
    return p.x-r<0||p.y-r<0||p.x+r>WORLD_W||p.y+r>WORLD_H;
}

sf::Vector2f Game::spawnPosition()const{
    for(int i=0;i<100;i++){
        sf::Vector2f p{frnd(80,WORLD_W-80),frnd(100,WORLD_H-80)};
        if(dist(p,player.pos)>550&&!blocked(p,40))return p;
    }
    return {100,100};
}

sf::Vector2f Game::mousePosition()const{
    return window.mapPixelToCoords(sf::Mouse::getPosition(window),camera);
}

Weapon& Game::weapon(){
    return weapons[player.weapon];
}

const Weapon& Game::weapon()const{
    return weapons[player.weapon];
}

float Game::damageMultiplier()const{
    return 1+(player.level-1)*.07f;
}

int Game::neededXp()const{
    return 100+(player.level-1)*80;
}

sf::Color Game::enemyColor(int type)const{
    if(type==0)return sf::Color(90,190,100);
    if(type==1)return sf::Color(220,180,60);
    if(type==2)return sf::Color(80,150,220);
    if(type==3)return sf::Color(220,90,80);
    return sf::Color(180,50,210);
}

string Game::enemyName(int type)const{
    if(type==0)return "Walker";
    if(type==1)return "Runner";
    if(type==2)return "Spitter";
    if(type==3)return "Brute";
    return "Necro Lord";
}

int Game::baseHp(int type)const{
    if(type==0)return 55;
    if(type==1)return 40;
    if(type==2)return 85;
    if(type==3)return 150;
    return 2200;
}

int Game::baseDamage(int type)const{
    if(type==0)return 9;
    if(type==1)return 7;
    if(type==2)return 12;
    if(type==3)return 20;
    return 35;
}

float Game::baseSpeed(int type)const{
    if(type==0)return 75;
    if(type==1)return 125;
    if(type==2)return 55;
    if(type==3)return 48;
    return 45;
}

int Game::baseXp(int type)const{
    if(type==0)return 25;
    if(type==1)return 35;
    if(type==2)return 55;
    if(type==3)return 90;
    return 1200;
}

int Game::baseGold(int type)const{
    if(type==0)return 15;
    if(type==1)return 25;
    if(type==2)return 45;
    if(type==3)return 80;
    return 1500;
}

void Game::shopWeapon(int i){
    if(i<0||i>=(int)weapons.size())return;

    if(weapons[i].owned){
        player.weapon=i;
        return;
    }

    if(player.gold<weapons[i].price)return;

    player.gold-=weapons[i].price;
    weapons[i].owned=true;
    weapons[i].ammo=weapons[i].magazine;
    weapons[i].reserve=weapons[i].maxReserve/2;
    player.weapon=i;
}

void Game::shopAmmo(){
    if(player.gold<80)return;
    player.gold-=80;
    weapon().reserve=min(weapon().maxReserve,weapon().reserve+weapon().magazine*2);
}

void Game::shopMedkit(){
    if(player.gold<70)return;
    player.gold-=70;
    player.medkits++;
}

void Game::shopArmor(){
    if(player.gold<250)return;
    player.gold-=250;
    player.armor++;
}

void Game::addGold(int n){
    player.gold+=max(0,n);
}

void Game::addXp(int n){
    player.xp+=max(0,n);
}

void Game::addScore(int n){
    player.score+=max(0,n);
}

void Game::fullHeal(){
    player.hp=player.maxHp;
}

void Game::refillAmmo(){
    for(auto& w:weapons)if(w.owned)w.reserve=w.maxReserve;
}

void Game::refillEnergy(){
}

int Game::ownedWeapons()const{
    int n=0;
    for(const auto& w:weapons)if(w.owned)n++;
    return n;
}

/*
===============================================================================
EXTENSION GUIDE
===============================================================================

The following notes document how this game can be expanded into a larger
production-style project.

1. TEXTURES
   Replace CircleShape and RectangleShape objects with sf::Sprite objects.
   Keep textures in an AssetManager so each image is loaded only once.

2. ANIMATION
   Store an animation state on Player and Enemy:
       Idle
       Walk
       Attack
       Hurt
       Death
   Advance a sprite-sheet rectangle based on delta time.

3. AUDIO
   Add sf::SoundBuffer and sf::Sound for:
       pistol.wav
       shotgun.wav
       hit.wav
       explosion.wav
       pickup.wav
       levelup.wav
   Add sf::Music for background tracks.

4. MAP COLLISION
   Replace the decorative grid with a tile map.
   Each tile can have:
       walkable
       wall
       water
       road
       building
       door
       loot
   Collision can then use an integer map instead of only world bounds.

5. ENEMY AI
   Add an enum:
       Idle
       Chase
       Attack
       Retreat
       Search
   Then use a state machine for each enemy.

6. PATH FINDING
   For large maps use A* or another pathfinding algorithm.
   Each enemy can request a path from its tile to the player's tile.

7. PROJECTILES
   Current bullets are simple objects.
   A production projectile can contain:
       sprite
       trail
       lifetime
       owner
       collision mask
       critical chance
       penetration
       explosion radius

8. WEAPON SYSTEM
   Weapon data can be moved to JSON or another data file.
   This avoids recompiling the program when damage or prices change.

9. SAVE SYSTEM
   Current save data is intentionally simple text.
   A production version should include:
       save version
       checksum
       player name
       map state
       quest state
       inventory
       unlocked weapons
       settings

10. UI
    A dedicated UI manager could handle:
       buttons
       labels
       sliders
       inventory slots
       quest cards
       tooltips
       popups
       notifications

11. SCREEN SHAKE
    When an explosion happens:
       shakeTime += amount;
       shakeStrength = amount;
    Then add a small random offset to the camera.

12. MINIMAP
    Render a small representation of the world in the HUD.
    Draw player and enemy positions as colored dots.

13. NPCS
    Add:
       Survivor
       Merchant
       Medic
       Quest Giver
    Use dialogue boxes and choices.

14. MISSIONS
    Add objectives such as:
       Kill enemies
       Collect supplies
       Reach an area
       Protect NPC
       Survive a timer
       Defeat boss

15. DIFFICULTY
    Easy:
       slower enemies
       cheaper shop
       more drops
    Normal:
       current balance
    Hard:
       higher enemy damage
       fewer drops
       stronger boss

16. CONTROLLER
    SFML exposes joystick/gamepad APIs.
    Map:
       left stick -> movement
       right stick -> aim
       trigger -> shoot
       buttons -> reload/grenade/medkit

17. FULLSCREEN
    Use:
       sf::State::Fullscreen
    with a valid desktop video mode.

18. SETTINGS
    Add:
       music volume
       sound volume
       mouse sensitivity
       fullscreen
       resolution
       difficulty
       screen shake

19. PARTICLES
    Current particles use circles.
    Upgrade them to textured particles and particle emitters.

20. LIGHTING
    Use render textures or shaders for:
       flashlight
       muzzle light
       explosion light
       darkness
       night maps

21. SHADERS
    SFML supports shaders.
    They can add:
       hit flash
       damage vignette
       color grading
       blur
       outlines

22. NETWORK
    SFML also contains network functionality.
    A future multiplayer version could synchronize:
       player position
       weapon state
       bullets
       enemy state
       pickups
       score

23. ARCHITECTURE
    When the game grows, split this file into:
       Game.hpp
       Game.cpp
       Player.hpp
       Player.cpp
       Enemy.hpp
       Enemy.cpp
       Weapon.hpp
       Weapon.cpp
       Bullet.hpp
       Bullet.cpp
       UI.hpp
       UI.cpp
       AudioManager.hpp
       AudioManager.cpp
       SaveManager.hpp
       SaveManager.cpp

24. COMPONENT SYSTEM
    A larger game could use an entity-component system:
       Transform
       Sprite
       Collider
       Health
       Weapon
       AI
       Lifetime

25. OBJECT POOLS
    Bullets and particles are created frequently.
    Object pools can reduce allocations in very busy scenes.

26. DATA DRIVEN DESIGN
    Put balance numbers in data:
       weapons.json
       enemies.json
       quests.json
       levels.json
    Designers can then modify the game without changing C++ logic.

27. TESTING
    Add tests for:
       damage calculation
       XP calculation
       level-up
       save/load
       shop purchases
       collision
       quest completion

28. PROFILING
    Measure:
       update time
       render time
       particle count
       enemy count
       bullet count
    Optimize only after measuring.

29. BUILD SYSTEM
    This project uses CMake and FetchContent.
    The first configuration downloads SFML 3.0.2.
    Later builds use the downloaded CMake dependency.

30. DISTRIBUTION
    A release package should contain:
       ZombieFrontier.exe
       required SFML DLLs if using shared libraries
       assets/
       save folder
       README

===============================================================================
*/

int main(){
    Game game;
    game.run();
    return 0;
}
