import React, { Component } from 'react';
import { Platform, ScrollView, StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Keyboard, Picker, Clipboard } from 'react-native';
import { SearchBar, Icon, Card } from 'react-native-elements';
import { debounce } from 'lodash';

class JokesScreen extends Component {
  constructor(props){
    super(props);
    this.state={
      searchText: "",
      jokes: [],
      category: "",
      categories: [],
    };

    this.baseUrl = 'https://api.chucknorris.io/jokes/';

    this.getRandomJoke = this.getRandomJoke.bind(this);
    this.searchQuery = this.searchQuery.bind(this);
    this.getCategories = this.getCategories.bind(this);
    this.clearResults = this.clearResults.bind(this);
    this.writeToClipboard = this.writeToClipboard.bind(this);

    this.debouncedSearch = debounce(this.searchQuery, 900).bind(this);
  }

  static navigationOptions (props) {
    return {
      header:
        <View>
        <SearchBar
          showLoading
          clearIcon={{ color: 'red' }}
          searchIcon={{ size: 24 }}
          onChangeText={(e) => {
            props.navigation.state.params.searchQuery(e)
          }}
          onClearText={(e) => {
            props.navigation.state.params.clearResults(e)
          }}
          placeholder='Search for a joke...'>
          </SearchBar>
      </View>
    };
  };

  componentWillMount() {
    this.getCategories();
  }

  componentDidMount(){
    this.props.navigation.setParams({
      searchQuery: (nesto) => {this.debouncedSearch(nesto)},
      clearResults: (nesto) => {this.clearResults(nesto)}
    });
  }

  render() {
    var PickerItems = [];
    this.state.categories
    && this.state.categories.length
    && this.state.categories.map((cat, index)  => {
      PickerItems.push(<Picker.Item key={index} label={cat} value={cat} />)
    });
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          {
            this.state.loading &&
            <ActivityIndicator size="large" color="#2f95dc" />
          }
          <View style={styles.row}>
            <Text style={styles.categoryLabel}>Category:</Text>
            <Picker
              selectedValue={this.state.category}
              style={{ height: 50, flex: 4 }}
              onValueChange={(itemValue) => this.setState({category: itemValue})}>
              <Picker.Item label='Select category' value='' />
              {
                PickerItems
              }
            </Picker>
          </View>
          {
            this.state.jokes.map((joke, index) => (
              <Card
                  key={index}
                  containerStyle={styles.cardContainer}
                >
                  <View>
                    <Text>{joke.value}</Text>
                  </View>
                  <Icon
                    onPress={() => this.writeToClipboard(joke.value)}
                    raised
                    name='copy'
                    type='font-awesome'
                    color='#2f95dc'
                    size={12}
                    underlayColor='#fefefe'/>
                </Card>
            ))
          }
        </ScrollView>
        {
          !this.state.jokes.length && <View style={styles.tabBarInfoContainer}>
            <Text style={styles.tabBarInfoText}>
            {'Fetch some jokes by pressing the plus button in the corner'}
            </Text>
          </View>
        }

        <TouchableOpacity activeOpacity={0.9} onPress={this.getRandomJoke} style={styles.TouchableOpacityStyle} >
        <Icon
          raised
          name='plus'
          type='font-awesome'
          color='#2f95dc'
          size={25}
          underlayColor='#fefefe'/>
        </TouchableOpacity>
      </View>

    );
  }
  writeToClipboard(joke) {
    Clipboard.setString(joke);
    alert('Copied to Clipboard!');
  }

  getRandomJoke() {
    // https://api.chucknorris.io/jokes/random?category={category}
    const url = `${this.baseUrl}random${this.state.category ? '?category='+this.state.category : ''}`;
    fetch(url)
      .then((response) => {
        if ([200, 201, 204].indexOf(response.status) > -1) {
          return response.json();
        } else {
          throw('Network error');
        }
      })
      .then((responseJson) => {
        let jokes = this.state.jokes;
        jokes.unshift(responseJson);
        this.setState({
          jokes: jokes
        });
        return;
      })
      .catch((error) => {
        console.error(error);
      });
  }

  getCategories() {
    // https://api.chucknorris.io/jokes/categories
    fetch(`${this.baseUrl}categories`, {
      method: 'GET'
    }).then(response => {
      if ([200, 201, 204].indexOf(response.status) > -1) {
        return response.json();
      } else {
        throw('Network error');
      }
    })
    .then((responseJson) => {
      if(responseJson.length > 0) {
        this.setState({ categories: responseJson});
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  clearResults(nesto) {
    console.log(nesto);
    this.setState({
      jokes: []
    });
  }

  searchQuery(nesto) {
    if(!nesto.length) return;
    this.setState({
      searchText: nesto,
      loading: true
    });
    // https://api.chucknorris.io/jokes/search?query={queryString}
    fetch(`${this.baseUrl}search?query=${nesto}`, {
      method: 'GET'
    }).then( response => {
      if ([200, 201, 204].indexOf(response.status) > -1) {
        return response.json();
      } else {
        throw('Network error');
      }
    })
    .then((data) => {
      let results = JSON.parse(JSON.stringify(data));
      if (parseInt(results.total) > 0) {
        let jokes = results.result;
        this.setState({
          jokes: jokes,
          loading: false,
        }, () => Keyboard.dismiss());
      } else {
        this.setState({
          loading: false});
      }
      return;
      })
      .catch((error) => {
        console.error(error);
      });
  }
}

const styles = StyleSheet.create({
  TouchableOpacityStyle: {
    backgroundColor: 'transparent',
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    right: 30,
    bottom: 30,
    padding: 5,
    ...Platform.select({
      ios: {
      },
      android: {
        elevation: 25,
      },
    }),
  },
  row:{
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 16,
    flex: 1,
    width: 100,
    flexDirection: 'column',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    padding: 5,
    paddingBottom: 6,
  },
  header: {
    backgroundColor: '#2a2d2f',
  },
  container: {
    flex: 1,
    padding: 5,
    backgroundColor: '#e1e8ee',
  },
  cardContainer: {
    backgroundColor: '#fff',
    flex: 1,
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 90,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
});

export default JokesScreen;