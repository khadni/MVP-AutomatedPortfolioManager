APP_DIR = app
ROOT_DIR = .

install: install_frontend install_backend install_contracts

# Install front-end dependencies
install_frontend:
	cd $(APP_DIR) && npm install

# Install back-end dependencies
install_backend:
	cd $(ROOT_DIR) && npm install

# Install Forge dependencies
install_contracts:
	cd $(ROOT_DIR) && \
	forge install smartcontractkit/chainlink-brownie-contracts@0.8.0 --no-commit && \
	forge install OpenZeppelin/openzeppelin-contracts@v4.9.6 --no-commit && \
	forge install foundry-rs/forge-std --no-commit
