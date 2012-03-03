import commands, os

# Create target directory
if not os.path.exists('dist'):
	os.makedirs('dist')

# nano source files
files = [
	'nano.js',
	'util/template.js',
	'util/Observable.js'
]

# Merge all files
content = ''

for file in files:
	content = content + '\n' + open('src/nano/'+file).read()

open('dist/nano.js', 'wb').write(content)

# jshint
out = commands.getoutput('nodejs build/jshint-check.js')

print out

# compile using clousure compiler
os.system('java -jar build/compiler.jar --js src/nano/nano.js --js_output_file dist/nano.min.js')