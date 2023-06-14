import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Modal } from 'react-native';

type ModalComponentProps = {
  visible: boolean;
  onCancel: () => void;
  onAction: () => void;
  actionText: string;
  modalText: string;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

const ModalComponent: React.FC<ModalComponentProps> = ({ visible, onCancel, onAction, actionText, setModalVisible, modalText }) => {
  if (!visible) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType='fade'>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>{modalText}</Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={onAction}>
              <Text style={styles.modalButtonText}>{actionText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'rgb(30, 30, 30)',
    borderColor: 'rgb(70, 70, 70)',
    borderWidth: 3,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 30,
    width: '80%',
    maxHeight: '50%',
  },
  modalText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 10,
    borderRadius: 4,
    backgroundColor: 'red',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ModalComponent;
