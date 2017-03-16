var mathutil = {}

mathutil.getPoissonToste = function(lambda)
{
	lambda = (lambda<=0) ? 0.001 : lambda;
	lambda = (lambda>=1) ? 0.999 : lambda;

	var L = Math.pow(1-lambda , lambda);
	var p = 1.0;
	var k = 0;

	do
	{
		k ++;
		p *= Math.random();
	}
	while (p > L);

	return k - 1;
}

mathutil.getPoisson = function(lambda)
{
	var L = Math.exp(-lambda);
	var p = 1.0;
	var k = 0;

	do
	{
		k ++;
		p *= Math.random();
	}
	while (p > L);

	return k - 1;
}

mathutil.getBinomial = function(n, p)
{
	var x = 0;

	for(var i = 0; i < n; i++)
	{
		if(Math.random() < p)
			x++;
	}

	return x;
}

mathutil.trial = function trial()
{
    var count = 0, sum = 0;
    while (sum <= 1)
	{
        sum += Math.random();
        count++;
    }

    return count;
}

mathutil.monteCarlo = function monteCarlo(n)
{
    var total = 0;

    for (var i = 0; i < n; i++)
        total += mathutil.trial();

    return total / n;
}

mathutil.monteCarloPI = function monteCarloPI(n)
{
    var total = 0;
	var value = 0;
	var hit = 0;

    for (var i = 1; i <= n; i++)
	{
		var x = Math.random();
		var y = Math.random();
		var r = Math.sqrt(Math.pow(x - 0.5, 2) + Math.pow(y - 0.5, 2));
  		total++;

  		if (r < 0.5)
		{
			hit++;
 			value = hit / total * 4;
		}
	}

    return value;
}

module.exports = mathutil
