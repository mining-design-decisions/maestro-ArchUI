import nltk
packages_to_dl = [
    'punkt',
    'averaged_perceptron_tagger',
    'stopwords',
    'wordnet'
]
for pkg in packages_to_dl:
    nltk.download(pkg)