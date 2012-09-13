var fs = require('fs');

var recursiveIterate = function(rootDirPath, rootDirAlias, excludes) {
	var fileList = [],
		file = null,
		fileStats = null,
		dirContents = fs.readdirSync(rootDirPath);

	dirContents.forEach(function(dirItem) {
		if (-1 === excludes.indexOf(dirItem)) {
			file = rootDirPath + '/' + dirItem;
			fileStats = fs.statSync(file);
			if (fileStats.isFile()) {
				fileList.push(rootDirAlias + '/' + dirItem);
			} else if (fileStats.isDirectory()) {
				fileList = fileList.concat(recursiveIterate(
					file,
					rootDirAlias + '/' + dirItem,
					excludes
				));
			}			
		}
	});

	return fileList;
};

var parseArgv = function(argIndex) {
	var nvpairs = {};
	var nvpair = [];

	for (i in process.argv) {
		if (argIndex <= i) {
			nvpair = process.argv[i].split('=');
			nvpairs[nvpair[0]] = nvpair[1];
		}
	}

	return nvpairs;
}

// ---------- MAIN -----------

var args = parseArgv(2);

args.rootDir = args.rootDir || process.cwd();
args.alias = args.alias || '.';
args.excludes = args.excludes ? args.excludes.split(',') : [];

console.log('ARGS:');
console.log(args);

console.log('LIST:');
console.log(recursiveIterate(args.rootDir, args.alias, args.excludes));
