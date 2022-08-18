
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
pm2 start app.py --interpreter python3

curl localhost:5000

git clone git@github.com/kat159/backtest_web.git

# transfer file from local to ec2
# 不要用home/ubuntu,自动添加了
# scp -i proxy-jump.pem -r ./stock_data ubuntu@ec2-3-95-186-234.compute-1.amazonaws.com:backtest_microserver/stock_data
scp -i proxy-jump.pem -r ./stock_data ubuntu@ec2-3-95-186-234.compute-1.amazonaws.com:backtest_microserver
