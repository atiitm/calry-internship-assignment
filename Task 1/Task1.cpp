// Question 1 -  Meeting Scheduler
// C++ code
#include <iostream>
#include <algorithm>
#include <vector>

using namespace std;

typedef long long int ll;
#define endl "\n"
#define mod 1000000007
#define fr(i, m, n) for (ll i = m; i < n; i++)
#define rf(i, m, n) for (ll i = n - 1; i >= m; i--)

vector<vector<int>> optimizeBookings(vector<vector<int>> &intervals,vector<vector<int>> &ans)
{
  int n = intervals.size();
  sort(intervals.begin(), intervals.end());  // Sorting the reservations by their start times can simplify the merging process.
  for (int i = 0; i < n; i++)
  {
    if (ans.empty() || ans.back()[1] < intervals[i][0]) // Use a loop to traverse through sorted reservations, merging them as needed based on overlap or direct continuity.
    {
      ans.push_back(intervals[i]);
    }
    else
    {
      ans.back()[1] = max(ans.back()[1], intervals[i][1]);
    }
  }
  return ans;
}

void solve()
{
  int n;
  cin >> n;
  vector<vector<int>> bookings;
  fr(i, 0, n)
  {
    int x, y;
    cin >> x >> y;
    bookings.push_back({x, y});
  }
  vector<vector<int>> merged_array;
  optimizeBookings(bookings, merged_array);
  for (auto r : merged_array)
  {
    cout << r[0] << " " << r[1] << endl;
  }
}

int main()
{
  int t = 1;
  // cin>>t;
  while (t--)
  {
    solve();
  }
  return 0;
}
