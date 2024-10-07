import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Modal, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker';


function RecipesScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [recipeName, setRecipeName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [expandedRecipeId, setExpandedRecipeId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('Alphabetical');

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const recipesSnapshot = await firestore().collection('Recipes').get();
      const recipesList = recipesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecipes(recipesList);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  const handleRecipePress = (recipe) => {
    setSelectedRecipe(selectedRecipe === recipe ? null : recipe);
    setExpandedRecipeId(recipe.id === expandedRecipeId ? null : recipe.id);
  };




  const handleImagePicker = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      console.log('Response:', response);
      if (!response.didCancel) {
        const selectedImageUri = response.assets[0].uri;
        setImageUrl(selectedImageUri);
      }
    });
  };

  const handleSearch = () => {
    const lowercaseQuery = searchQuery.toLowerCase();
    const filteredRecipes = recipes.filter(recipe => {
      const recipeNameLower = recipe.RecipeName.toLowerCase();
      const ingredientsLower = recipe.Ingredients.toLowerCase();
      return recipeNameLower.includes(lowercaseQuery) || ingredientsLower.includes(lowercaseQuery);
    });
    return filteredRecipes;
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
  };

  const getSortedRecipes = () => {
    if (filterType === 'Alphabetical') {
      return handleSearch().sort((a, b) => a.RecipeName.localeCompare(b.RecipeName));
    } else if (filterType === 'LastAdded') {
      return handleSearch().sort((a, b) => b.id.localeCompare(a.id));
    }
    return handleSearch();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}> RelaxAwayRecipes</Text>
      </View>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by title or ingredient"
        value={searchQuery}
        onChangeText={(text) => setSearchQuery(text)}
      />
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'Alphabetical' && styles.activeFilterButton]}
          onPress={() => handleFilterChange('Alphabetical')}
        >
          <Text style={[styles.filterText, filterType === 'Alphabetical' && styles.activeFilterText]}>Alphabetical</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'LastAdded' && styles.activeFilterButton]}
          onPress={() => handleFilterChange('LastAdded')}
        >
          <Text style={[styles.filterText, filterType === 'LastAdded' && styles.activeFilterText]}>Last Added</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.recipeList}>
        {getSortedRecipes().map(recipe => (
          <TouchableOpacity
            key={recipe.id}
            style={styles.recipeItem}
            onPress={() => handleRecipePress(recipe)}
          >
            <View style={styles.recipeInfo}>
              <Image source={{ uri: recipe.ImageUrl }} style={[styles.recipeImage, { height: (expandedRecipeId === recipe.id ? 100 : 50), width: (expandedRecipeId === recipe.id ? 100 : 50) }]} />
              <Text style={styles.recipeName}>{recipe.RecipeName}</Text>
            </View>
            {selectedRecipe && selectedRecipe.id === recipe.id && (
              <View style={styles.recipeDetails}>
                <Text style={styles.recipeTitle}>Ingredients:</Text>
                <Text style={styles.recipeText}>{recipe.Ingredients}</Text>
                <Text style={styles.recipeTitle}>Instructions:</Text>
                <Text style={styles.recipeText}>{recipe.Instructions}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Add Recipe</Text>
            <TouchableOpacity onPress={handleImagePicker}>
              <Text style={styles.selectImageText}>Select Image</Text>
            </TouchableOpacity>
            {imageUrl !== '' && <Image source={{ uri: imageUrl }} style={styles.selectedImage} />}
            <TextInput
              style={styles.input}
              placeholder="Recipe Name"
              value={recipeName}
              onChangeText={text => setRecipeName(text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Ingredients"
              value={ingredients}
              onChangeText={text => setIngredients(text)}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Instructions"
              value={instructions}
              onChangeText={text => setInstructions(text)}
              multiline
            />
          
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal:10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#7600bc',
    borderRadius: 10,
    paddingBottom:20,
    marginBottom:15
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color:'#6327ce'
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal:30,
  },
  filterButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  activeFilterButton: {
    backgroundColor: '#451b90',
  },
  filterText: {
    color: '#451b90',
    fontWeight: 'bold',
  },
  activeFilterText: {
    color: '#fff',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  recipeList: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
  },
  recipeItem: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    borderRadius: 10,
    padding:10
  },
  recipeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recipeImage: {
    borderRadius: 25,
    marginRight: 10,
    marginBottom:10
  },
  recipeName: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000',
  },
  deleteButton: {
    color: 'red',
    fontWeight: 'bold',
  },
  recipeDetails: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  recipeText: {
    fontSize: 16,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    minWidth: '80%',
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color:"black"
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    marginVertical: 10,
    marginHorizontal: 5,
    borderRadius:1,
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 5,
    marginBottom: 10,
  },
  selectImageText:{
    borderWidth: 1,
    borderColor: '#7600bc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    color:'#7600bc',
    justifyContent:'center',
    alignItems:'center',
    textAlign:'center',
  }

});

export default RecipesScreen;
