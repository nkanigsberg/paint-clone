<h1>Game of Life</h1>
<p>Based on <a href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life">Conway's Game of Life</a></p>
<h2>Rules</h2>
<h3>Standard</h3>
<h4>For a space that is populated</h4>
<ul>
  <li>Each cell with one or no neighbours dies, as if by solitude</li>
  <li>Each cell with four or more neighbours dies, as if by overpopulation</li>
  <li>Each cell with two or three neighbours survives</li>
</ul>
<h4>For a space that is empty or unpopulated</h4>
<ul>
  <li>Each cell with three neighbours becomes populated</li>
</ul>
<h3>High Life</h3>
<ul>
  <li>Same as standard, plus:</li>
  <li>Each cell with six neighbours becomes populated - this allows for more complex, and <a href="https://www.conwaylife.com/wiki/Replicator">self-replicating</a> patterns</li>
</ul>