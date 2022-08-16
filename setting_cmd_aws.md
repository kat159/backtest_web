
# update apt
sudo apt update

# install mysql
sudo apt install mysql-server

sudo systemctl status mysql

sudo mysql

mysql> ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';
mysql> ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password_here';
mysql> FLUSH PRIVILEGES;
mysql> exit
sudo mysql -u root -p

# install node
sudo apt install curl -y
sudo apt policy nodejs
sudo apt install nodejs
sudo apt install npm


# run
npm install forever -g
forever start bin/www
forever start server/bin/www


forever start -c python3 app.py
