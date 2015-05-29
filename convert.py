import sys, os;


def list_file() :
	return os.listdir("./_posts/");

def work(file_name) :
	readfile = open("./_posts/" + file_name, "r");
	writefile = open("./tmp.md", "w");

	lines = readfile.readlines();
	writefile.writelines(lines);
	writefile.close();

	writefile = open("./tmp.md", "w");
	writefile.write(":D");
	writefile.close();


	print lines;

file_list = list_file();
for line in file_list :
	work(line);


